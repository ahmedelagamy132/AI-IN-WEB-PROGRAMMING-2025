"""API routes for managing conversation history with the database.

This router demonstrates how to integrate database operations with FastAPI,
showing students how to implement CRUD operations, use dependency injection
for database sessions, and structure endpoints for a REST API.
"""

import uuid
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conversation, Message


router = APIRouter(prefix="/conversations", tags=["conversations"])
logger = logging.getLogger(__name__)


# Pydantic schemas for request/response validation
class MessageSchema(BaseModel):
    """Schema for a message in API responses."""
    
    id: int
    role: str
    content: str
    created_at: str
    
    class Config:
        from_attributes = True


class ConversationSchema(BaseModel):
    """Schema for a conversation in API responses."""
    
    id: str
    title: str | None
    created_at: str
    updated_at: str
    message_count: int | None = None
    
    class Config:
        from_attributes = True


class ConversationDetailSchema(BaseModel):
    """Schema for a conversation with its messages."""
    
    id: str
    title: str | None
    created_at: str
    updated_at: str
    messages: List[MessageSchema]
    
    class Config:
        from_attributes = True


class CreateConversationRequest(BaseModel):
    """Schema for creating a new conversation."""
    
    title: str | None = None


@router.post("/", response_model=ConversationSchema)
def create_conversation(
    payload: CreateConversationRequest,
    db: Session = Depends(get_db)
) -> Conversation:
    """Create a new conversation.
    
    This endpoint demonstrates how to use database sessions as dependencies
    and how to generate unique IDs for new records.
    
    Args:
        payload: The conversation creation data.
        db: Database session injected by FastAPI.
        
    Returns:
        The newly created conversation.
    """
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        title=payload.title or "New Conversation"
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    logger.info(f"Created conversation {conversation.id}")
    
    # Add message_count for the response
    conversation_dict = {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "message_count": 0
    }
    
    return conversation_dict  # type: ignore[return-value]


@router.get("/", response_model=List[ConversationSchema])
def list_conversations(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
) -> List[dict]:
    """List all conversations with pagination.
    
    This endpoint teaches pagination patterns and how to efficiently
    query related data using SQLAlchemy.
    
    Args:
        skip: Number of records to skip (for pagination).
        limit: Maximum number of records to return.
        db: Database session injected by FastAPI.
        
    Returns:
        List of conversations with message counts.
    """
    
    conversations = (
        db.query(Conversation)
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Add message counts to each conversation
    result = []
    for conv in conversations:
        result.append({
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "message_count": conv.messages.count()
        })
    
    return result


@router.get("/{conversation_id}", response_model=ConversationDetailSchema)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
) -> dict:
    """Retrieve a specific conversation with all its messages.
    
    This endpoint demonstrates how to handle path parameters and
    load related data efficiently using eager loading.
    
    Args:
        conversation_id: The unique identifier of the conversation.
        db: Database session injected by FastAPI.
        
    Returns:
        The conversation with all its messages.
        
    Raises:
        HTTPException: 404 if the conversation doesn't exist.
    """
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get all messages ordered by creation time
    messages = conversation.messages.order_by(Message.created_at.asc()).all()
    
    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
) -> dict[str, str]:
    """Delete a conversation and all its messages.
    
    This endpoint demonstrates cascading deletes and transaction handling.
    
    Args:
        conversation_id: The unique identifier of the conversation.
        db: Database session injected by FastAPI.
        
    Returns:
        Success message.
        
    Raises:
        HTTPException: 404 if the conversation doesn't exist.
    """
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    logger.info(f"Deleted conversation {conversation_id}")
    
    return {"message": "Conversation deleted successfully"}


@router.post("/{conversation_id}/messages", response_model=MessageSchema)
def add_message(
    conversation_id: str,
    role: str,
    content: str,
    db: Session = Depends(get_db)
) -> dict:
    """Add a message to an existing conversation.
    
    This endpoint is used internally to persist messages as they are
    generated during chat interactions.
    
    Args:
        conversation_id: The unique identifier of the conversation.
        role: Either 'user' or 'assistant'.
        content: The message text.
        db: Database session injected by FastAPI.
        
    Returns:
        The created message.
        
    Raises:
        HTTPException: 404 if the conversation doesn't exist.
    """
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return {
        "id": message.id,
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at.isoformat()
    }
