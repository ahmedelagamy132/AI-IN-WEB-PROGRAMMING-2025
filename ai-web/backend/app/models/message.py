"""Message model for storing individual chat messages.

This model shows students how to store chat messages with proper relationships
to their parent conversation. It demonstrates foreign key constraints, indexing
strategies, and how to model text content efficiently in a database.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class Message(Base):
    """Represents a single message in a conversation.
    
    Messages are the building blocks of conversations, containing the actual
    text exchanged between users and the AI. This model teaches:
    - Foreign key relationships
    - Efficient text storage
    - Timestamp tracking
    - Role-based message types
    
    Attributes:
        id: Unique identifier for the message (auto-incrementing).
        conversation_id: Foreign key linking to the parent conversation.
        role: Either 'user' or 'assistant' to identify the sender.
        content: The actual message text.
        created_at: When the message was created.
        conversation: Relationship back to the parent Conversation object.
    """
    
    __tablename__ = "messages"
    
    # Auto-incrementing primary key for simple ordered access
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign key to conversations table
    conversation_id = Column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True  # Index for fast lookups by conversation
    )
    
    # Role can be 'user' or 'assistant' - consider using an enum in production
    role = Column(String(20), nullable=False)
    
    # The actual message content - Text type supports large messages
    content = Column(Text, nullable=False)
    
    # Timestamp for ordering messages within a conversation
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True  # Index for time-based queries
    )
    
    # Bidirectional relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self) -> str:
        """Provide a helpful string representation for debugging."""
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message(id={self.id}, role={self.role}, content='{content_preview}')>"
    
    def to_dict(self) -> dict:
        """Convert message to dictionary format for API responses.
        
        This method demonstrates how to serialize database objects into
        JSON-friendly formats that match the API response schemas.
        """
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
