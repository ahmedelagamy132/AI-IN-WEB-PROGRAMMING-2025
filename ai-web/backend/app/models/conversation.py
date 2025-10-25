"""Conversation model for storing chat sessions.

This model demonstrates how to create a database table for tracking user
conversations with the AI assistant. Each conversation has a unique identifier
and can contain multiple messages, showing students the one-to-many relationship
pattern in relational databases.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Conversation(Base):
    """Represents a chat conversation session in the database.
    
    A conversation is a container for a series of messages between the user
    and the AI assistant. This model is designed to support features like:
    - Conversation history browsing
    - Session management
    - Analytics on conversation patterns
    - Export functionality for students
    
    Attributes:
        id: Unique identifier for the conversation (primary key).
        title: Optional human-readable title for the conversation.
        created_at: Timestamp when the conversation was started.
        updated_at: Timestamp when the conversation was last modified.
        messages: Collection of Message objects belonging to this conversation.
    """
    
    __tablename__ = "conversations"
    
    # Primary key using UUID-style strings for distributed-friendly IDs
    id = Column(String(36), primary_key=True, index=True)
    
    # Optional title that can be auto-generated from the first message
    title = Column(String(255), nullable=True)
    
    # Context field for storing conversation context or tags (renamed from metadata to avoid SQLAlchemy conflict)
    context = Column(Text, nullable=True)
    
    # Timestamp tracking for audit and sorting
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    # Relationship to messages - demonstrates one-to-many pattern
    # cascade="all, delete-orphan" means deleting a conversation deletes its messages
    # back_populates creates a bidirectional relationship
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="dynamic",  # Load messages on-demand for better performance
    )
    
    def __repr__(self) -> str:
        """Provide a helpful string representation for debugging."""
        return f"<Conversation(id={self.id}, title={self.title}, messages={self.messages.count()})>"
