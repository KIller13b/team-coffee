import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.contracts import router as contracts_router
from app.api.risks import router as risks_router
from app.api.agents import router as agents_router
from app.api.timeline import router as timeline_router

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(
    title="Odin — Multi-Agent Contract Intelligence API",
    description="Backend microservice coordinating Odin, Thor, Norns, Loki, Heimdall, and Tyr.",
    version="1.0.0",
)

# CORS configuration - supports all localhost/127.0.0.1 dev ports (5173, 5174, etc.)
origins_str = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
)
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes with /api prefix
app.include_router(contracts_router, prefix="/api")
app.include_router(risks_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(timeline_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "Odin Multi-Agent Contract Intelligence",
        "status": "online",
        "version": "1.0.0",
        "agents": ["Odin", "Thor", "Norns", "Loki", "Heimdall", "Tyr"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
