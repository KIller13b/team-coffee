# Odin Backend — Multi-Agent Contract Intelligence API

FastAPI backend microservice providing REST and WebSocket endpoints for Odin's multi-agent contract foresight system.

## Setup & Running

1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
   ```

4. Verify health:
   - API Docs: [http://localhost:5000/docs](http://localhost:5000/docs)
   - Status: [http://localhost:5000/health](http://localhost:5000/health)
