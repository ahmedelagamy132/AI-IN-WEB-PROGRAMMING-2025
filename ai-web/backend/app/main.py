"""FastAPI application entry point used by the lab backend container."""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.echo import router as echo_router
from app.routers.gemini import router as gemini_router
from app.routers.chatbot import router as chatbot_router

# Load environment variables from a local .env file when present so the
# application picks up credentials configured for the labs.
load_dotenv()

app = FastAPI()
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


@app.get("/health")
def health() -> dict[str, str]:
    """Report service status for lab curl checks and container health probes."""

    return {"status": "ok"}
