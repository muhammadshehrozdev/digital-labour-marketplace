#!/usr/bin/env bash
# First admin on the production (Atlas) database, from Ubuntu (WSL) with Docker.
# Builds the database indexes, then runs the real create-admin script, in a throwaway
# node:24-bookworm container:
#   - the repository's backend folder is mounted READ-ONLY and copied inside the container
#     (without node_modules and without backend/.env, so no local setting can leak in);
#   - the production packages are installed inside the container only;
#   - the secrets come from an env file that must live OUTSIDE the repository.
# The container is deleted when the script ends. The script asks for the password twice (hidden)
# and, because Atlas is not this computer, asks you to type "yes" first.
#
# Usage (in the repository folder):
#   bash scripts/atlas-create-admin.sh ~/dlm-secrets/production.env --name "Full Name" --email you@example.com --phone 03001234567
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-}"
if [[ -z "$ENV_FILE" || "$#" -lt 7 ]]; then
  echo 'Usage: bash scripts/atlas-create-admin.sh <env file outside the repo> --name "Full Name" --email you@example.com --phone 03001234567'
  exit 1
fi
shift

if [[ ! -f "$ENV_FILE" ]]; then echo "Env file not found: $ENV_FILE"; exit 1; fi
ENV_REAL="$(realpath "$ENV_FILE")"
if [[ "$ENV_REAL" == "$ROOT"/* ]]; then
  echo "Refusing: the env file is inside the repository ($ENV_REAL). Keep it outside, for example ~/dlm-secrets/production.env"
  exit 1
fi
if ! grep -q '^MONGO_URI=mongodb' "$ENV_REAL"; then
  echo "Refusing: $ENV_REAL has no MONGO_URI=mongodb+srv://... line (write it without quotes)."
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not available. Start Docker Desktop (with WSL integration for Ubuntu) and try again."
  exit 1
fi

docker run --rm -it \
  --env-file "$ENV_REAL" \
  -e DOTENV_CONFIG_QUIET=true \
  -v "$ROOT/backend:/src:ro" \
  node:24-bookworm \
  bash -c '
    set -e
    mkdir -p /app
    tar -C /src --exclude=node_modules --exclude=.env --exclude=.local -cf - . | tar -C /app -xf -
    cd /app
    echo "Installing the production packages inside the container (about a minute)..."
    npm ci --omit=dev --no-audit --no-fund --loglevel=error
    echo "Building the database indexes (safe to repeat; changes no data)..."
    node scripts/createIndexes.js
    node scripts/createAdmin.js "$@"
  ' bash "$@"
