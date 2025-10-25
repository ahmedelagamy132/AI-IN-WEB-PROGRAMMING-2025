# Access Your Chatbot Application

## 🌐 Application URLs

### Frontend (Main Application)
- **URL**: https://didactic-sthpace-enigma-55gqr455w5j3vvvj-5173.app.github.dev
- This is where you interact with all features including the chatbot

### Backend API
- **API Docs**: https://didactic-space-enigma-55gqr455w5j3vvvj-8000.app.github.dev/docs
- **Health Check**: https://didactic-space-enigma-55gqr455w5j3vvvj-8000.app.github.dev/health

## 🎯 Testing the Chatbot

### Via the Web Interface
1. Open the frontend URL above
2. Scroll to the "AI Teaching Assistant Chatbot" section
3. Type a message like "What is FastAPI?" and click Send
4. Continue the conversation - the chatbot maintains context!

### Via API (for testing)
```bash
curl -X POST https://didactic-space-enigma-55gqr455w5j3vvvj-8000.app.github.dev/chat/message \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello! What is React?", "history": []}'
```

## 🔧 Managing the Application

### View Container Status
```bash
cd /workspaces/AI-IN-WEB-PROGRAMMING-2025/ai-web
docker-compose ps
```

### View Logs
```bash
# Backend logs
docker-compose logs backend -f

# Frontend logs
docker-compose logs frontend -f

# All logs
docker-compose logs -f
```

### Restart Services
```bash
# Restart backend only
docker-compose restart backend

# Restart everything
docker-compose restart

# Stop all services
docker-compose down

# Start services
docker-compose up -d
```

## 📱 Accessing from Another Computer

1. In VS Code, open the **PORTS** tab (bottom panel, next to Terminal)
2. Find ports **5173** and **8000**
3. Right-click each port → **Port Visibility** → **Public**
4. Share the URLs above with anyone - they're now publicly accessible!

## 🧪 Test the Chatbot Features

### Test Conversation Context
1. Message 1: "What is FastAPI?"
2. Message 2: "How does it compare to Flask?"
   - The chatbot should reference FastAPI from the first message

### Test Error Handling
1. Clear your conversation
2. Try sending an empty message
3. Observe the friendly error message

### Test UI Features
- **Auto-scroll**: Messages automatically scroll to the latest
- **Clear conversation**: Click the red "Clear conversation" button
- **Loading states**: Watch the "Assistant is typing..." indicator
- **Message styling**: User messages (blue) vs Assistant messages (gray)

## 🛠️ Development Workflow

### Frontend-Backend Connection

The frontend connects to the backend using `http://localhost:8000` within the browser. Both services run in Docker containers with ports exposed to the host, so the browser can access them via localhost.

**Configuration:**
- Frontend: Runs on port 5173, accessible at the Codespace URL
- Backend: Runs on port 8000, accessible at `http://localhost:8000` from your browser
- CORS: Backend allows all origins for development convenience

This setup works because:
1. Your browser accesses the frontend through the Codespace forwarded port
2. The browser then makes API calls to `http://localhost:8000` 
3. The Codespace port forwarding routes these requests to the backend container

### Make Backend Changes
1. Edit files in `backend/app/`
2. Backend auto-reloads (watch the logs)
3. Test immediately - no rebuild needed

### Make Frontend Changes
1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. See changes instantly in the browser

### Change Environment Variables
1. Edit `backend/.env`
2. Restart backend: `docker-compose restart backend`

## 📊 API Endpoints

### Chatbot
- **POST** `/chat/message` - Send a message and get AI response

### Other Features
- **POST** `/flaky-echo` - Echo service with retry demo
- **POST** `/ai/lesson-outline` - Generate lesson outlines
- **GET** `/health` - Service health check

## 🎓 What You Built

✅ **Full-stack chatbot** with React + FastAPI
✅ **Conversation context** - Multi-turn dialogues
✅ **Gemini AI integration** - Powered by Google's LLM
✅ **Clean architecture** - Service layer pattern
✅ **Modern UI** - Auto-scroll, loading states, error handling
✅ **Production-ready** - Error handling, logging, validation
✅ **Docker deployment** - Containerized and portable

## 🚀 Next Steps

1. **Test the chatbot** - Ask it about web programming topics
2. **Experiment with prompts** - Try different questions
3. **Check the code** - Review the implementation
4. **Explore features** - Try the echo and lesson outline features too
5. **Share the link** - Show it to others using the public URLs

---

**Note**: These URLs are specific to your current Codespace session. If you restart the Codespace, the URLs will change (but the pattern remains the same).
