"""API routes that expose the chatbot service to the frontend.

Following the same teaching pattern as the Gemini router, this module provides
thoroughly documented endpoints that demonstrate how to build a conversational
interface with optional database persistence. Instructors can use this as a
reference for multi-turn chat flows with data persistence.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, constr
from sqlalchemy.orm import Session

from app.services.chatbot import ChatbotServiceError, send_chat_message
from app.database import get_db
from app.models import Conversation, Message

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
    conversation_id: Optional[str] = None  # Optional ID to persist the conversation


class ChatResponse(BaseModel):
    """Response schema returned to the frontend with the assistant's reply."""

    role: str
    content: str
    conversation_id: Optional[str] = None  # Return the conversation ID if persisted


@router.post("/message", response_model=ChatResponse)
def chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db)
) -> ChatResponse:
    """Handle a chat message and return the assistant's response.

    This endpoint demonstrates how to maintain conversation context across
    multiple API calls with optional database persistence. The frontend can
    choose to provide a conversation_id to save messages to the database,
    enabling features like conversation history and resume.

    Args:
        payload: Contains the user's message, optional conversation history,
                and optional conversation_id for persistence.
        db: Database session injected by FastAPI.

    Returns:
        The assistant's response message with optional conversation_id.

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
        
        # If conversation_id is provided, verify it exists
        conversation = None
        if payload.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == payload.conversation_id
            ).first()
            
            if not conversation:
                raise HTTPException(
                    status_code=404,
                    detail=f"Conversation {payload.conversation_id} not found"
                )
        
        # Save user message to database if conversation exists
        if conversation:
            user_message = Message(
                conversation_id=conversation.id,
                role="user",
                content=payload.message
            )
            db.add(user_message)
            db.commit()
            logger.info(f"Saved user message to conversation {conversation.id}")
        
        # Get AI response
        result = send_chat_message(
            message=payload.message,
            history=history_dicts
        )
        
        # Save assistant response to database if conversation exists
        if conversation:
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=result["content"]
            )
            db.add(assistant_message)
            db.commit()
            logger.info(f"Saved assistant message to conversation {conversation.id}")
        
    except ValueError as exc:
        # Map validation issues (such as an empty message) to an HTTP 422 so
        # the frontend can display a friendly inline error message.
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ChatbotServiceError as exc:
        # Log the full stack trace for instructors while returning a concise
        # error payload to the browser.
        logger.exception("Chatbot message request failed")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return ChatResponse(
        **result,
        conversation_id=conversation.id if conversation else None
    )
