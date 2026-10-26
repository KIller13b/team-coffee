#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================================="
echo "  ⚔  ODIN : THE CONTRACT WAR ROOM — STARTUP SCRIPT"
echo "=================================================================="

# Function to clean up background processes on exit
cleanup() {
  echo -e "\n[!] Shutting down War Room servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend on port 8000
echo "[+] Starting Odin Backend (FastAPI on http://127.0.0.1:8000)..."
python3 -m uvicorn odin.backend.api.main:app --host 0.0.0.0 --port 8000 --log-level warning &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 1
until curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; do
  echo "    Waiting for backend..."
  sleep 1
done
echo "    ✓ Backend is live at http://127.0.0.1:8000"

# 2. Start Vite Frontend on port 5173
echo "[+] Starting Odin War Room Dashboard (Vite on http://127.0.0.1:5173)..."
cd odin/frontend
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=================================================================="
echo "  ⚔  WAR ROOM READY TO LAUNCH"
echo "  • Web Dashboard:  http://localhost:5173"
echo "  • Backend API:    http://localhost:8000"
echo "  • API Docs:       http://localhost:8000/docs"
echo "  • CLI Runner:     python3 cli.py"
echo "=================================================================="
echo "Press Ctrl+C to stop all servers."

wait
