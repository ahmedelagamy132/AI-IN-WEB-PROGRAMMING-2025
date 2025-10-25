# Quick Start: Using the Database

## 🚀 Getting Started in 3 Steps

### Step 1: Start Everything

```bash
cd ai-web
docker-compose up --build
```

Wait for these messages:
```
✓ Database initialized successfully
✓ Application startup complete
```

### Step 2: Load Sample Data (Optional)

```bash
docker exec -it ai-web-backend-1 python scripts/seed_database.py
```

### Step 3: Try It Out!

Visit: http://localhost:8000/docs

---

## 💡 Simple Examples

### Example 1: Create Your First Conversation

**Using curl:**
```bash
curl -X POST http://localhost:8000/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Chat"}'
```

**Using the API docs:**
1. Go to http://localhost:8000/docs
2. Find `POST /conversations`
3. Click "Try it out"
4. Enter: `{"title": "My First Chat"}`
5. Click "Execute"

**Response:**
```json
{
  "id": "abc-123-def-456",
  "title": "My First Chat",
  "message_count": 0
}
```

**💾 Save the ID** - you'll need it next!

---

### Example 2: Chat and Save Messages

**Replace `YOUR_ID_HERE` with the ID from Step 1:**

```bash
curl -X POST http://localhost:8000/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Python?",
    "conversation_id": "YOUR_ID_HERE"
  }'
```

**Response:**
```json
{
  "role": "assistant",
  "content": "Python is a high-level programming language...",
  "conversation_id": "YOUR_ID_HERE"
}
```

✅ **This message is now saved in the database!**

---

### Example 3: View Your Conversation History

```bash
curl http://localhost:8000/conversations/YOUR_ID_HERE
```

**Response:**
```json
{
  "id": "YOUR_ID_HERE",
  "title": "My First Chat",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "What is Python?"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Python is a high-level programming language..."
    }
  ]
}
```

---

### Example 4: List All Your Conversations

```bash
curl http://localhost:8000/conversations
```

**Response:**
```json
[
  {
    "id": "YOUR_ID_HERE",
    "title": "My First Chat",
    "message_count": 2,
    "created_at": "2025-11-04T12:00:00"
  }
]
```

---

## 🎯 Key Features

| Feature | Command | What It Does |
|---------|---------|--------------|
| **Create** | `POST /conversations` | Start a new chat session |
| **Chat** | `POST /chat/message` | Talk to AI (saves automatically) |
| **View** | `GET /conversations/{id}` | See full chat history |
| **List** | `GET /conversations` | See all your chats |
| **Delete** | `DELETE /conversations/{id}` | Remove a conversation |

---

## 🔧 Useful Commands

### Check if database is working:
```bash
docker exec -it ai-web-backend-1 python scripts/test_database.py
```

### View database directly:
```bash
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb
```

Then try:
```sql
SELECT * FROM conversations;
SELECT * FROM messages;
```

Type `\q` to exit.

### Reset everything:
```bash
docker-compose down -v
docker-compose up --build
```

---

## 📊 What's Happening Behind the Scenes?

```
You send a message
       ↓
Backend receives it
       ↓
Saves to PostgreSQL database
       ↓
Sends to Gemini AI
       ↓
Gets AI response
       ↓
Saves AI response to database
       ↓
Returns response to you
```

**Everything is saved!** You can come back later and continue your conversation.

---

## 🎓 Learning Points

### For Students:

1. **Database Persistence**: Your chats are saved permanently
2. **RESTful APIs**: Standard HTTP methods (GET, POST, DELETE)
3. **Relationships**: Conversations have many messages (1:N)
4. **Docker Compose**: Multiple services working together
5. **ORM**: Object-relational mapping with SQLAlchemy

### For Instructors:

- Demonstrate CRUD operations
- Show database relationships
- Teach API design patterns
- Explain Docker orchestration
- Illustrate transaction management

---

## ❓ FAQ

**Q: Do I need to install PostgreSQL on my computer?**
A: No! It runs in Docker automatically.

**Q: Where is the data stored?**
A: In a Docker volume called `postgres_data`. It persists across restarts.

**Q: Can I use the chatbot without saving to database?**
A: Yes! Just don't include `conversation_id` in your chat requests.

**Q: How do I see all the API endpoints?**
A: Visit http://localhost:8000/docs for interactive documentation.

**Q: Can I add more tables?**
A: Yes! Create new models in `app/models/` and they'll be created automatically.

---

## 🎉 You're Ready!

Now you can:
- ✅ Save conversations to a database
- ✅ Retrieve conversation history
- ✅ Build features that persist data
- ✅ Learn full-stack development patterns

**Next Steps:**
- Explore the API docs: http://localhost:8000/docs
- Read the full guide: `docs/DATABASE_INTEGRATION.md`
- Try the sample data: `python scripts/seed_database.py`

---

**Happy Coding! 🚀**
