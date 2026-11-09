#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipeline failures
IFS=$'\n\t'       # Stricter word splitting

CACHE_DIR=/var/lib/devcontainer-firewall
GH_CACHE="$CACHE_DIR/github-meta.json"
mkdir -p "$CACHE_DIR" && chmod 700 "$CACHE_DIR"

# If anything fails after the rules are flushed, close the firewall instead of leaving it open.
fail_closed() {
    echo "ERROR: firewall setup failed - closing all outbound traffic except localhost and DNS"
    iptables -P INPUT DROP; iptables -P FORWARD DROP; iptables -P OUTPUT DROP
    iptables -A OUTPUT -o lo -j ACCEPT; iptables -A INPUT -i lo -j ACCEPT
    iptables -A OUTPUT -p udp --dport 53 -j ACCEPT; iptables -A INPUT -p udp --sport 53 -j ACCEPT
}

# 1. Gather ALL network data first, while the current rules still allow it.
DOCKER_DNS_RULES=$(iptables-save -t nat | grep "127\.0\.0\.11" || true)

echo "Fetching GitHub IP ranges..."
gh_ranges=$(curl -sf --max-time 15 https://api.github.com/meta || true)
if [ -n "$gh_ranges" ] && echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null 2>&1; then
    echo "$gh_ranges" > "$GH_CACHE.tmp" && mv "$GH_CACHE.tmp" "$GH_CACHE"
    echo "GitHub ranges fetched and cached"
elif [ -s "$GH_CACHE" ] && jq -e '.web and .api and .git' "$GH_CACHE" >/dev/null 2>&1; then
    echo "WARNING: GitHub fetch failed (rate limit or timeout) - using cached copy from $(date -r "$GH_CACHE")"
    gh_ranges=$(cat "$GH_CACHE")
else
    echo "WARNING: GitHub fetch failed and no cache - continuing WITHOUT GitHub access (firewall stays closed)"
    gh_ranges='{"web":[],"api":[],"git":[]}'
fi

declare -A DOMAIN_IPS=()
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "sentry.io" \
    "statsig.com" \
    "marketplace.visualstudio.com" \
    "vscode.blob.core.windows.net" \
    "update.code.visualstudio.com"; do
    DOMAIN_IPS[$domain]=$(dig +time=3 +tries=2 +noall +answer A "$domain" | awk '$4 == "A" {print $5}' || true)
    if [ -z "${DOMAIN_IPS[$domain]}" ]; then echo "WARNING: could not resolve $domain - skipped"; fi
done

# Runs whenever the script ends with an error (a failed command OR an explicit "exit 1").
trap 'rc=$?; if [ "$rc" -ne 0 ]; then fail_closed; fi' EXIT

# Flush existing rules and delete existing ipsets
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

# 2. Selectively restore ONLY internal Docker DNS resolution
if [ -n "$DOCKER_DNS_RULES" ]; then
    echo "Restoring Docker DNS rules..."
    iptables -t nat -N DOCKER_OUTPUT 2>/dev/null || true
    iptables -t nat -N DOCKER_POSTROUTING 2>/dev/null || true
    echo "$DOCKER_DNS_RULES" | xargs -L 1 iptables -t nat
else
    echo "No Docker DNS rules to restore"
fi

# First allow DNS and localhost before any restrictions
# Allow outbound DNS
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
# Allow inbound DNS responses
iptables -A INPUT -p udp --sport 53 -j ACCEPT
# Allow outbound SSH
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
# Allow inbound SSH responses
iptables -A INPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
# Allow localhost
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Create ipset with CIDR support
ipset create allowed-domains hash:net

# Add GitHub IP ranges (fetched before flushing; see step 1)
echo "Processing GitHub IPs..."
while read -r cidr; do
    if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
        echo "ERROR: Invalid CIDR range from GitHub meta: $cidr"
        exit 1
    fi
    echo "Adding GitHub range $cidr"
    ipset add -exist allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

# Add the other allowed domains (resolved before flushing; see step 1)
for domain in "${!DOMAIN_IPS[@]}"; do
    while read -r ip; do
        [ -z "$ip" ] && continue
        if [[ ! "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "ERROR: Invalid IP from DNS for $domain: $ip"
            exit 1
        fi
        echo "Adding $ip for $domain"
        ipset add -exist allowed-domains "$ip"
    done < <(echo "${DOMAIN_IPS[$domain]}")
done

# Get host IP from default route
HOST_IP=$(ip route | grep default | cut -d" " -f3)
if [ -z "$HOST_IP" ]; then
    echo "ERROR: Failed to detect host IP"
    exit 1
fi

HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
echo "Host network detected as: $HOST_NETWORK"

# Set up remaining iptables rules
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# Set default policies to DROP first
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# First allow established connections for already approved traffic
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Then allow only specific outbound traffic to allowed domains
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT

# Explicitly REJECT all other outbound traffic for immediate feedback
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited

echo "Firewall configuration complete"
echo "Verifying firewall rules..."
if curl --connect-timeout 5 --max-time 10 https://example.com >/dev/null 2>&1; then
    echo "ERROR: Firewall verification failed - was able to reach https://example.com"
    exit 1
else
    echo "Firewall verification passed - unable to reach https://example.com as expected"
fi

# Verify GitHub API access
if ! curl --connect-timeout 5 --max-time 10 https://api.github.com/zen >/dev/null 2>&1; then
    echo "WARNING: unable to reach https://api.github.com (GitHub ranges missing?) - firewall is still closed"
else
    echo "Firewall verification passed - able to reach https://api.github.com as expected"
fi
