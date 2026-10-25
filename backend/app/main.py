import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.contracts import router as contracts_router
from app.api.risks import router as risks_router
from app.api.agents import router as agents_router

load_dotenv()

app = FastAPI(
    title="Odin — Multi-Agent Contract Intelligence API",
    description="Backend microservice coordinating Odin, Thor, Norns, Loki, Heimdall, and Tyr.",
    version="1.0.0",
)

# CORS configuration
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes with /api prefix
app.include_router(contracts_router, prefix="/api")
app.include_router(risks_router, prefix="/api")
app.include_router(agents_router, prefix="/api")

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
