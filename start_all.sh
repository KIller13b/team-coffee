#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "⚔️ Starting Odin: The Contract War Room (Track 2) from: $DIR"

# Kill any lingering instances on ports 8000 and 5173
echo "Cleaning ports 8000 and 5173..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

# Start Backend
echo "Starting Node.js/Express MERN Backend on http://localhost:8000..."
npm --prefix "$DIR/backend" run dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for Backend to report healthy..."
for i in {1..30}; do
  if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Backend online and healthy (PID: $BACKEND_PID)!"
    break
  fi
  sleep 0.5
done

# Start Frontend
echo "Starting Vite Frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================================================="
echo "🛡️  ODIN CONTRACT WAR ROOM IS FULLY OPERATIONAL!"
echo "   • Frontend UI:    http://localhost:5173"
echo "   • Backend API:     http://localhost:8000"
echo "   • API Docs:        http://localhost:8000/docs"
echo "=========================================================================="
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT TERM
wait
