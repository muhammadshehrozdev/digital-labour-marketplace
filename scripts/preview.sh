#!/usr/bin/env bash
# Local preview in the dev container: MongoDB + backend API + frontend, with one command.
#
#   bash scripts/preview.sh start        normal preview (database from backend/.env: dlm_local_preview)
#   bash scripts/preview.sh demo         defence demo (separate database dlm_demo, synthetic accounts only)
#   bash scripts/preview.sh reset-demo   wipe dlm_demo and put back the demo accounts and the synthetic Module 4, 5 and 6 demo data
#   bash scripts/preview.sh status       what is running
#   bash scripts/preview.sh stop         stop everything
#
# The servers keep running after the terminal is closed. Logs: .local/preview/*.log
# Local only: MongoDB listens on 127.0.0.1; the demo database must be local (see backend/scripts/resetDemo.js).
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN="$ROOT/.local/preview"
DEMO_URI="mongodb://127.0.0.1:27017/dlm_demo"
URL="http://127.0.0.1:5173"
mkdir -p "$RUN"

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

wait_for() { # port seconds name log
  local i
  for ((i = 0; i < $2; i++)); do
    if port_open "$1"; then return 0; fi
    sleep 1
  done
  echo "  $3 did not start within $2 seconds. Last lines of $4:"
  tail -n 15 "$4" 2>/dev/null | sed 's/^/    /'
  return 1
}

# Start a command in its own session and process group, detached from this terminal. Only the one
# command goes to the background (so its process number is also its group number for "stop").
start_bg() { # name dir command...
  local name="$1" dir="$2"
  shift 2
  cd "$dir" || return 1
  setsid nohup "$@" >"$RUN/$name.log" 2>&1 </dev/null &
  echo $! >"$RUN/$name.pid"
  cd "$ROOT" || return 1
}

# Stop a service: its own process group if we started it, otherwise whatever listens on its port.
stop_service() { # name port
  local name="$1" port="$2" pid pgid mine
  mine="$(ps -o pgid= -p $$ | tr -d ' ')"
  if [[ -f "$RUN/$name.pid" ]]; then
    pid="$(cat "$RUN/$name.pid")"
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null
    rm -f "$RUN/$name.pid"
  fi
  for _ in $(seq 1 20); do port_open "$port" || break; sleep 0.5; done
  if port_open "$port"; then # started some other way (another terminal)
    for pid in $(ss -ltnpH "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u); do
      pgid="$(ps -o pgid= -p "$pid" | tr -d ' ')"
      if [[ -n "$pgid" && "$pgid" != "$mine" && "$pgid" != 1 ]]; then kill -TERM -- "-$pgid" 2>/dev/null; else kill -TERM "$pid" 2>/dev/null; fi
    done
    for _ in $(seq 1 20); do port_open "$port" || break; sleep 0.5; done
  fi
  if port_open "$port"; then echo "  $name: still running on port $port (stop it by hand)"; else echo "  $name: stopped"; fi
}

start_mongo() {
  if port_open 27017; then echo "  MongoDB: already running"; return 0; fi
  start_bg mongo "$ROOT/backend" node scripts/localMongo.js
  wait_for 27017 90 MongoDB "$RUN/mongo.log" && echo "  MongoDB: running (127.0.0.1:27017)"
}

start_backend() { # mode
  if port_open 5000; then
    if [[ "$(cat "$RUN/mode" 2>/dev/null)" == "$1" ]]; then echo "  Backend: already running ($1 mode)"; return 0; fi
    echo "  Backend: running in another mode, restarting it in $1 mode"
    stop_service backend 5000 >/dev/null
  fi
  if [[ "$1" == demo ]]; then
    start_bg backend "$ROOT/backend" env MONGO_URI="$DEMO_URI" npm run dev
  else
    start_bg backend "$ROOT/backend" npm run dev
  fi
  echo "$1" >"$RUN/mode"
  wait_for 5000 60 Backend "$RUN/backend.log" || return 1
  for _ in $(seq 1 30); do
    if curl -sf http://127.0.0.1:5000/api/health | grep -q '"db":"connected"'; then echo "  Backend: running (http://127.0.0.1:5000), database connected"; return 0; fi
    sleep 1
  done
  echo "  Backend: running, but the database is not connected yet (see $RUN/backend.log)"
}

start_frontend() {
  if port_open 5173; then echo "  Frontend: already running"; return 0; fi
  start_bg frontend "$ROOT/frontend" npm run dev
  wait_for 5173 60 Frontend "$RUN/frontend.log" && echo "  Frontend: running"
}

demo_is_empty() {
  (cd "$ROOT/backend" && node --input-type=module -e "
    import mongoose from 'mongoose';
    await mongoose.connect('$DEMO_URI', { serverSelectionTimeoutMS: 5000 });
    const n = await mongoose.connection.db.collection('users').countDocuments();
    await mongoose.disconnect();
    process.exit(n === 0 ? 0 : 1);")
}

reset_demo() {
  # the three demo accounts, then the synthetic Module 4 bookings and reviews (Batch 6), then the synthetic
  # Module 5 prices, payment records and one "[Demo]" price guide entry (Batch 7), then the synthetic Module 6
  # job requests in every state (Batch 8B)
  (cd "$ROOT/backend" && node scripts/resetDemo.js --yes && node scripts/seedModule4Demo.js && node scripts/seedModule5Demo.js && node scripts/seedModule6Demo.js)
}

start_all() { # mode
  echo "Starting the local preview ($1 mode)..."
  start_mongo || exit 1
  if [[ "$1" == demo ]] && demo_is_empty; then
    echo "  The demo database is empty: creating the demo accounts first."
    reset_demo >"$RUN/reset.log" 2>&1 || { echo "  Reset failed, see $RUN/reset.log"; exit 1; }
  fi
  start_backend "$1" || exit 1
  start_frontend || exit 1
  echo
  echo "Open in Chrome: $URL"
  if [[ "$1" == demo ]]; then
    echo "Demo accounts (synthetic): worker.demo@example.com / customer.demo@example.com  password local-demo-password-123"
    echo "                           admin.demo@example.com  password: local admin demo passphrase"
  fi
  echo "Stop with: bash scripts/preview.sh stop"
}

status() {
  local mode
  mode="$(cat "$RUN/mode" 2>/dev/null || echo unknown)"
  port_open 27017 && echo "  MongoDB:  running" || echo "  MongoDB:  stopped"
  port_open 5000 && echo "  Backend:  running ($mode mode)" || echo "  Backend:  stopped"
  port_open 5173 && echo "  Frontend: running at $URL" || echo "  Frontend: stopped"
}

case "${1:-}" in
  start) start_all preview ;;
  demo) start_all demo ;;
  reset-demo)
    echo "Resetting the demo database (dlm_demo only; your normal preview database is not touched)..."
    start_mongo || exit 1
    reset_demo
    ;;
  stop)
    echo "Stopping the local preview..."
    stop_service frontend 5173
    stop_service backend 5000
    stop_service mongo 27017
    rm -f "$RUN/mode"
    ;;
  status) status ;;
  *)
    echo "Usage: bash scripts/preview.sh start | demo | reset-demo | status | stop"
    exit 1
    ;;
esac
