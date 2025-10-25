"""Database configuration and session management for the teaching platform.

This module demonstrates how to integrate a PostgreSQL database with FastAPI,
showing students the proper patterns for connection pooling, session management,
and dependency injection. Instructors can reference this when teaching about
persistence layers in web applications.
"""

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session


# Read database URL from environment variable with a sensible default for development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://aiwebuser:aiwebpass@localhost:5432/aiweb"
)

# Create the SQLAlchemy engine with connection pooling
# The pool settings are tuned for a teaching environment where multiple
# students might be accessing the same database instance
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,         # Keep 5 connections in the pool
    max_overflow=10,     # Allow up to 10 additional connections when needed
)

# Create a SessionLocal class that will produce database sessions
# autocommit=False means we control when to commit transactions
# autoflush=False gives us more explicit control over when changes are sent to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models - all database tables will inherit from this
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Provide a database session for each request.
    
    This is a FastAPI dependency that creates a new database session for each
    request and ensures it's properly closed when the request is complete.
    Students learn about context managers and the dependency injection pattern
    through this example.
    
    Yields:
        A SQLAlchemy Session instance for database operations.
        
    Example usage in a route:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize the database by creating all tables.
    
    This function is called during application startup to ensure all database
    tables exist. In a production environment, you would use Alembic migrations
    instead, but for teaching purposes this provides a clear demonstration of
    how SQLAlchemy creates tables from model definitions.
    """
    
    # Import all models here so SQLAlchemy knows about them
    from app.models import conversation, message  # noqa: F401
    
    # Create all tables defined by models inheriting from Base
    Base.metadata.create_all(bind=engine)
