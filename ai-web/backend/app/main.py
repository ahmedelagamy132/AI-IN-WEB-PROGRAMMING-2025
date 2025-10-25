"""FastAPI application entry point used by the lab backend container."""

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.echo import router as echo_router
from app.routers.gemini import router as gemini_router
from app.routers.chatbot import router as chatbot_router
from app.routers.conversations import router as conversations_router

# Load environment variables from a local .env file when present so the
# application picks up credentials configured for the labs.
load_dotenv()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events.
    
    This demonstrates the modern FastAPI pattern for handling initialization
    tasks like database setup. Instructors can explain how this ensures the
    database is ready before any requests are processed.
    """
    
    # Startup: Initialize database tables
    logger.info("Initializing database...")
    try:
        from app.database import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # Don't prevent startup - allow the app to run even if DB is unavailable
    
    yield  # Application runs here
    
    # Shutdown: Clean up resources if needed
    logger.info("Application shutting down")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
)

app.include_router(echo_router)
app.include_router(gemini_router)
app.include_router(chatbot_router)
app.include_router(conversations_router)


@app.get("/health")
def health() -> dict[str, str]:
    """Report service status for lab curl checks and container health probes."""

    return {"status": "ok"}
