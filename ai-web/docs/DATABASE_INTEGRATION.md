# Database Integration Guide

## Overview

The AI Web Programming Teaching Platform now includes a **PostgreSQL database** for persisting conversation history, user data, and other application state. This guide explains the database architecture, setup, and how to work with it.

## Architecture

### Database Stack

- **PostgreSQL 15**: Modern, reliable relational database
- **SQLAlchemy**: Python ORM for database operations
- **Alembic**: Database migration tool (for schema changes)
- **Docker Compose**: Orchestrates database and application containers

### Schema Design

The database follows a simple but extensible schema:

```
conversations
├── id (VARCHAR(36), PRIMARY KEY)
├── title (VARCHAR(255), NULLABLE)
├── metadata (TEXT, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

messages
├── id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
├── conversation_id (VARCHAR(36), FOREIGN KEY → conversations.id)
├── role (VARCHAR(20))
├── content (TEXT)
└── created_at (TIMESTAMP)
```

### Relationships

- **One-to-Many**: Each `Conversation` can have multiple `Messages`
- **Cascade Delete**: Deleting a conversation automatically deletes its messages
- **Indexed Fields**: `conversation_id` and `created_at` are indexed for performance

## Setup Instructions

### 1. Environment Configuration

Update your `backend/.env` file with database credentials:

```bash
# Database Configuration
DATABASE_URL=postgresql://aiwebuser:aiwebpass@db:5432/aiweb
```

For local development (without Docker):
```bash
DATABASE_URL=postgresql://aiwebuser:aiwebpass@localhost:5432/aiweb
```

### 2. Start the Services

The database is automatically started with Docker Compose:

```bash
cd ai-web
docker-compose up --build
```

This command:
1. Creates a PostgreSQL container with persistent storage
2. Waits for the database to be healthy
3. Starts the backend (which auto-creates tables)
4. Starts the frontend

### 3. Verify Database Connection

Check the backend logs for successful initialization:

```
INFO:     Initializing database...
INFO:     Database initialized successfully
```

### 4. Access the Database (Optional)

For debugging or inspection, connect to the database:

```bash
# Using Docker
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb

# Or from your host (if PostgreSQL client is installed)
psql -h localhost -U aiwebuser -d aiweb
```

## API Endpoints

### Conversation Management

#### Create a New Conversation

```bash
POST /conversations
Content-Type: application/json

{
  "title": "Learning Python Basics"
}

# Response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learning Python Basics",
  "created_at": "2025-11-04T12:00:00",
  "updated_at": "2025-11-04T12:00:00",
  "message_count": 0
}
```

#### List All Conversations

```bash
GET /conversations?skip=0&limit=20

# Response
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Learning Python Basics",
    "created_at": "2025-11-04T12:00:00",
    "updated_at": "2025-11-04T12:00:00",
    "message_count": 5
  }
]
```

#### Get Conversation Details

```bash
GET /conversations/{conversation_id}

# Response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learning Python Basics",
  "created_at": "2025-11-04T12:00:00",
  "updated_at": "2025-11-04T12:00:00",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "What is a Python list?",
      "created_at": "2025-11-04T12:00:00"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "A Python list is a mutable, ordered collection...",
      "created_at": "2025-11-04T12:00:05"
    }
  ]
}
```

#### Delete a Conversation

```bash
DELETE /conversations/{conversation_id}

# Response
{
  "message": "Conversation deleted successfully"
}
```

### Chat with Persistence

The chatbot endpoint now supports optional conversation persistence:

```bash
POST /chat/message
Content-Type: application/json

{
  "message": "Explain async/await in Python",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    {
      "role": "user",
      "content": "What is a Python list?"
    },
    {
      "role": "assistant",
      "content": "A Python list is a mutable, ordered collection..."
    }
  ]
}

# Response
{
  "role": "assistant",
  "content": "async/await in Python provides a way to write asynchronous code...",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Code Structure

### Database Layer (`app/database.py`)

- **Engine**: SQLAlchemy database engine with connection pooling
- **SessionLocal**: Factory for creating database sessions
- **Base**: Declarative base for all ORM models
- **get_db()**: Dependency function for FastAPI routes
- **init_db()**: Initializes database tables on startup

### Models (`app/models/`)

- **Conversation**: ORM model for conversation records
- **Message**: ORM model for message records
- **Relationships**: Configured with proper cascading and lazy loading

### Routers (`app/routers/conversations.py`)

- RESTful CRUD operations for conversations
- Pagination support
- Proper error handling and logging
- Database session management via dependency injection

## Teaching Points

This database integration demonstrates several important concepts:

### 1. **Dependency Injection**
```python
@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    # FastAPI automatically provides a database session
    return db.query(Conversation).all()
```

### 2. **ORM Relationships**
```python
class Conversation(Base):
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )
```

### 3. **Connection Pooling**
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections are alive
    pool_size=5,         # Keep 5 connections ready
    max_overflow=10      # Allow 10 more when needed
)
```

### 4. **Transaction Management**
```python
db.add(conversation)
db.commit()           # Commit changes
db.refresh(conversation)  # Reload from DB
```

### 5. **Schema Validation with Pydantic**
```python
class ConversationSchema(BaseModel):
    id: str
    title: str | None
    created_at: str
    
    class Config:
        from_attributes = True  # Allow ORM model conversion
```

## Database Migrations (Advanced)

For schema changes in production, use Alembic:

```bash
# Initialize Alembic (already done)
alembic init alembic

# Create a migration after changing models
alembic revision --autogenerate -m "Add user table"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## Troubleshooting

### Connection Errors

**Problem**: `psycopg2.OperationalError: could not connect to server`

**Solutions**:
1. Ensure PostgreSQL container is running: `docker-compose ps`
2. Check database is healthy: `docker-compose logs db`
3. Verify environment variables are correct
4. Wait for database startup (healthcheck should pass)

### Import Errors

**Problem**: `Import "sqlalchemy" could not be resolved`

**Solution**: The linter warnings are expected - packages are installed in Docker container:
```bash
# Verify in container
docker exec -it ai-web-backend-1 pip list | grep -i sql
```

### Migration Conflicts

**Problem**: Tables already exist when running migrations

**Solution**:
```bash
# Drop existing tables (DEV ONLY)
docker-compose down -v
docker-compose up --build
```

## Performance Considerations

### Indexing Strategy

Indexes are added to frequently queried columns:
- `conversations.id` (primary key, auto-indexed)
- `messages.conversation_id` (foreign key queries)
- `messages.created_at` (ordering/filtering)

### Query Optimization

```python
# ✅ Good: Use pagination
conversations = db.query(Conversation).limit(20).all()

# ✅ Good: Use lazy loading for large collections
conversation.messages.filter(Message.role == "user").all()

# ❌ Bad: Load everything
all_data = db.query(Conversation).all()  # Can be huge!
```

### Connection Management

The application uses connection pooling to handle concurrent requests efficiently:
- 5 persistent connections in the pool
- Up to 10 overflow connections for traffic spikes
- Automatic connection recycling

## Security Best Practices

1. **Use Environment Variables**: Never hardcode credentials
2. **Parameterized Queries**: SQLAlchemy automatically prevents SQL injection
3. **Validate Input**: Pydantic schemas validate all user input
4. **Least Privilege**: Database user has minimal required permissions
5. **SSL Connections**: Use `?sslmode=require` in production DATABASE_URL

## Future Enhancements

Potential improvements for advanced labs:

- [ ] User authentication and conversation ownership
- [ ] Full-text search across messages
- [ ] Message embeddings for semantic search
- [ ] Analytics and usage statistics
- [ ] Backup and restore procedures
- [ ] Read replicas for scaling
- [ ] Redis caching layer
- [ ] GraphQL interface

## Resources

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Database Tutorial](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## Summary

The database integration adds powerful persistence capabilities to the teaching platform while maintaining clean architecture and educational clarity. Students can now:

✅ Save and retrieve conversation history
✅ Learn database design patterns
✅ Understand ORM concepts
✅ Practice API design with CRUD operations
✅ See transaction management in action

The implementation follows production best practices while remaining accessible for teaching purposes.
