"""Database models package for the AI web programming teaching platform.

This package contains SQLAlchemy ORM models that map to database tables.
Each model demonstrates best practices for defining relationships, constraints,
and indexes that instructors can explain during database design lessons.
"""

from app.models.conversation import Conversation
from app.models.message import Message

__all__ = ["Conversation", "Message"]
