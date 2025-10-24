"""API routes that expose the chatbot service to the frontend.

Following the same teaching pattern as the Gemini router, this module provides
thoroughly documented endpoints that demonstrate how to build a conversational
interface. Instructors can use this as a reference for multi-turn chat flows.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, constr

from app.services.chatbot import ChatbotServiceError, send_chat_message

# Prefix the router with /chat so all chatbot endpoints are grouped together
# in the automatically generated FastAPI docs.
router = APIRouter(prefix="/chat", tags=["chat"])


logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    """Schema for a single message in the conversation."""

    role: str  # Either 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Request schema for sending a message to the chatbot."""

    message: constr(strip_whitespace=True, min_length=1)  # type: ignore[valid-type]
    history: list[ChatMessage] | None = None


class ChatResponse(BaseModel):
    """Response schema returned to the frontend with the assistant's reply."""

    role: str
    content: str


@router.post("/message", response_model=ChatResponse)
def chat_message(payload: ChatRequest) -> ChatResponse:
    """Handle a chat message and return the assistant's response.

    This endpoint demonstrates how to maintain conversation context across
    multiple API calls. The frontend sends the full message history with each
    request, allowing the backend to remain stateless while the LLM maintains
    context awareness.

    Args:
        payload: Contains the user's message and optional conversation history.

    Returns:
        The assistant's response message.

    Raises:
        HTTPException: 422 for validation errors, 503 for service failures.
    """

    try:
        # Convert Pydantic models to plain dicts for the service layer
        history_dicts = (
            [msg.model_dump() for msg in payload.history]
            if payload.history
            else None
        )
        
        result = send_chat_message(
            message=payload.message,
            history=history_dicts
        )
    except ValueError as exc:
        # Map validation issues (such as an empty message) to an HTTP 422 so
        # the frontend can display a friendly inline error message.
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ChatbotServiceError as exc:
        # Log the full stack trace for instructors while returning a concise
        # error payload to the browser.
        logger.exception("Chatbot message request failed")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return ChatResponse(**result)
