# Database Feature Summary

## What Was Added

A complete **PostgreSQL database integration** has been added to the AI Web Programming Teaching Platform. This addition enables:

✅ **Persistent conversation storage**
✅ **Conversation history management**
✅ **Message tracking and retrieval**
✅ **RESTful CRUD operations**
✅ **Production-ready database patterns**

## File Structure

```
ai-web/
├── docker-compose.yml (Updated with PostgreSQL service)
│
├── backend/
│   ├── requirements.txt (Added SQLAlchemy, psycopg2, alembic)
│   ├── .env.example (Added DATABASE_URL)
│   │
│   ├── app/
│   │   ├── main.py (Added database initialization & router)
│   │   ├── database.py (NEW - Database configuration)
│   │   │
│   │   ├── models/ (NEW)
│   │   │   ├── __init__.py
│   │   │   ├── conversation.py
│   │   │   └── message.py
│   │   │
│   │   └── routers/
│   │       ├── chatbot.py (Updated with persistence)
│   │       └── conversations.py (NEW - CRUD endpoints)
│   │
│   └── scripts/ (NEW)
│       └── seed_database.py (Sample data generator)
│
└── docs/
    ├── DATABASE_INTEGRATION.md (Complete guide)
    └── DATABASE_README.md (This file)
```

## Quick Start

### 1. Start the Application

```bash
cd ai-web
docker-compose up --build
```

This will:
- Start PostgreSQL database
- Initialize database tables
- Start backend API
- Start frontend

### 2. Verify Database

Check backend logs for:
```
INFO:     Initializing database...
INFO:     Database initialized successfully
```

### 3. Test the API

Visit the interactive API documentation:
```
http://localhost:8000/docs
```

### 4. Seed Sample Data (Optional)

```bash
docker exec -it ai-web-backend-1 python scripts/seed_database.py
```

## New API Endpoints

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/conversations` | Create a new conversation |
| GET | `/conversations` | List all conversations (paginated) |
| GET | `/conversations/{id}` | Get conversation with messages |
| DELETE | `/conversations/{id}` | Delete a conversation |

### Enhanced Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/message` | Send message (now with optional persistence) |

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(36) REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

## Usage Examples

### Create a Conversation

```bash
curl -X POST http://localhost:8000/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "Python Basics"}'
```

### Chat with Persistence

```bash
curl -X POST http://localhost:8000/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Python?",
    "conversation_id": "YOUR_CONVERSATION_ID_HERE"
  }'
```

### List Conversations

```bash
curl http://localhost:8000/conversations
```

### Get Conversation History

```bash
curl http://localhost:8000/conversations/{conversation_id}
```

## Educational Benefits

This database integration teaches students:

1. **Database Design**
   - Schema design
   - Relationships (one-to-many)
   - Foreign keys and cascading
   - Indexing strategies

2. **ORM Patterns**
   - SQLAlchemy models
   - Relationship definitions
   - Query construction
   - Transaction management

3. **API Design**
   - CRUD operations
   - RESTful endpoints
   - Pagination
   - Resource relationships

4. **Production Patterns**
   - Connection pooling
   - Dependency injection
   - Error handling
   - Session management

5. **Docker & Infrastructure**
   - Multi-container applications
   - Service dependencies
   - Health checks
   - Volume persistence

## Configuration

### Environment Variables

Add to `backend/.env`:

```bash
DATABASE_URL=postgresql://aiwebuser:aiwebpass@db:5432/aiweb
```

### Docker Compose

The database service includes:
- **Persistent storage** via Docker volumes
- **Health checks** to ensure backend waits for DB
- **Automatic initialization** of tables on startup

## Architecture Highlights

### Separation of Concerns

```
Router Layer (HTTP)
    ↓
Service Layer (Business Logic)
    ↓
Database Layer (ORM)
    ↓
PostgreSQL (Storage)
```

### Dependency Injection

```python
@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    # FastAPI automatically provides DB session
    return db.query(Conversation).all()
```

### Transaction Safety

```python
try:
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
except Exception:
    db.rollback()
    raise
finally:
    db.close()
```

## Development Workflow

### Making Schema Changes

1. Update models in `app/models/`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Apply migration: `alembic upgrade head`

### Resetting Database

```bash
# Stop and remove containers + volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### Accessing Database Directly

```bash
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb

# Then run SQL queries
SELECT * FROM conversations;
SELECT * FROM messages;
```

## Testing

### Manual Testing

1. Create conversation via API
2. Send chat messages with conversation_id
3. Retrieve conversation history
4. Verify messages are persisted

### Automated Testing

```bash
# Run tests (when implemented)
docker exec -it ai-web-backend-1 pytest
```

## Troubleshooting

### Database Connection Issues

**Symptom**: Backend can't connect to database

**Solutions**:
1. Check database is running: `docker-compose ps`
2. View database logs: `docker-compose logs db`
3. Verify credentials in `.env` file
4. Ensure `depends_on` health check passes

### Tables Not Created

**Symptom**: `relation "conversations" does not exist`

**Solutions**:
1. Check backend startup logs
2. Run manually: `docker exec -it ai-web-backend-1 python -c "from app.database import init_db; init_db()"`
3. Rebuild containers: `docker-compose up --build`

### Import Errors in IDE

**Symptom**: `Import "sqlalchemy" could not be resolved`

**Note**: This is expected - packages are installed in Docker container, not local environment. The code will work correctly when run in Docker.

## Performance Considerations

### Connection Pooling

- Pool size: 5 persistent connections
- Max overflow: 10 additional connections
- Pre-ping: Validates connections before use

### Indexing

- `conversation_id` indexed for fast message lookups
- `created_at` indexed for chronological queries
- Primary keys automatically indexed

### Query Optimization

```python
# ✅ Good: Paginated queries
conversations = db.query(Conversation).limit(20).all()

# ✅ Good: Lazy loading for relationships
conversation.messages.filter(...).all()

# ❌ Bad: Loading everything
all_data = db.query(Model).all()
```

## Future Enhancements

Potential additions for advanced lessons:

- [ ] User authentication and authorization
- [ ] Message full-text search
- [ ] Conversation sharing and exports
- [ ] Usage analytics and dashboards
- [ ] Message embeddings for semantic search
- [ ] Alembic migrations
- [ ] Redis caching layer
- [ ] Read replicas for scaling

## Resources

- **Full Documentation**: See `docs/DATABASE_INTEGRATION.md`
- **API Documentation**: http://localhost:8000/docs
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **PostgreSQL**: https://www.postgresql.org/docs/

## Summary

The database integration adds enterprise-grade persistence to the teaching platform while maintaining educational clarity. Students learn:

✅ Database design and relationships
✅ ORM patterns with SQLAlchemy
✅ RESTful API design
✅ Production deployment patterns
✅ Docker multi-container applications

The implementation follows best practices and provides a solid foundation for building full-stack web applications.
