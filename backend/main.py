"""
FastAPI Backend for E-Commerce AI Agent Customization System.

Run with:
    uvicorn main:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import customize_router, themes_router, images_router

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("Starting E-Commerce AI Agent Backend...")
    print(f"OpenAI API Key: {'Set' if os.getenv('OPENAI_API_KEY') else 'Not Set'}")
    print(f"Google API Key: {'Set' if os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY') else 'Not Set'}")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="E-Commerce AI Agent API",
    description="AI-powered customization system for e-commerce apps using json-render",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(customize_router)
app.include_router(themes_router)
app.include_router(images_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "E-Commerce AI Agent",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "openai": "configured" if os.getenv("OPENAI_API_KEY") else "not configured",
        "gemini": "configured" if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") else "not configured",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
