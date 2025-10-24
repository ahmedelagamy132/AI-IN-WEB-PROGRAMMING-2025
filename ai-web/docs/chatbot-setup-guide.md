# AI Teaching Assistant Chatbot - Setup and Testing Guide

This guide provides step-by-step instructions for running and testing the new chatbot feature.

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- Docker and Docker Compose
- A valid Gemini API key

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd /workspaces/AI-IN-WEB-PROGRAMMING-2025/ai-web/backend
cp .env.example .env
```

Edit `backend/.env` and add your Gemini API key:

```bash
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Start the Services

From the `ai-web` directory:

```bash
cd /workspaces/AI-IN-WEB-PROGRAMMING-2025/ai-web
docker-compose up --build
```

This will:
- Build the backend FastAPI container
- Build the frontend Vite/React container
- Start both services with hot-reload enabled

### 4. Access the Application

- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API Docs**: Open http://localhost:8000/docs for interactive API documentation

## Testing the Chatbot

### Frontend UI Testing

1. Navigate to http://localhost:5173
2. Scroll to the "AI Teaching Assistant Chatbot" section
3. Type a message like "What is FastAPI?" and click Send
4. Observe the conversation flow:
   - Your message appears on the right (blue)
   - Assistant's response appears on the left (gray)
   - Loading indicator shows while waiting
5. Continue the conversation to test context awareness
6. Click "Clear conversation" to reset

### Backend API Testing

Test the endpoint directly with curl:

```bash
# Simple message without history
curl -X POST http://localhost:8000/chat/message \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What is FastAPI?",
    "history": []
  }'

# Message with conversation history
curl -X POST http://localhost:8000/chat/message \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "How do I create a router?",
    "history": [
      {"role": "user", "content": "What is FastAPI?"},
      {"role": "assistant", "content": "FastAPI is a modern web framework for Python."}
    ]
  }'
```

### Interactive API Documentation

1. Navigate to http://localhost:8000/docs
2. Find the `/chat/message` endpoint under the "chat" tag
3. Click "Try it out"
4. Enter a test message in the request body:
   ```json
   {
     "message": "Explain React hooks",
     "history": []
   }
   ```
5. Click "Execute" to see the response

## Feature Overview

### What's Included

**Backend:**
- `app/services/chatbot.py` - Conversation logic and Gemini integration
- `app/routers/chatbot.py` - FastAPI endpoint at `/chat/message`
- Updated `app/main.py` - Router registration

**Frontend:**
- `src/features/chatbot/hooks/useChatbot.js` - State management
- `src/features/chatbot/components/ChatbotInterface.jsx` - UI component
- Updated `src/App.jsx` - Feature integration

### Key Features

✓ **Multi-turn conversations** - Full history sent with each request
✓ **Context awareness** - Assistant remembers previous messages
✓ **Optimistic UI** - Messages appear immediately
✓ **Auto-scroll** - Latest message always visible
✓ **Error handling** - Clear error messages
✓ **Clear conversation** - Reset button to start fresh
✓ **Loading states** - Visual feedback during API calls
✓ **Responsive design** - Clean, accessible interface

## Architecture Patterns

This implementation follows the project's established patterns:

1. **Service Layer Pattern**
   - Business logic isolated in `services/chatbot.py`
   - Reusable functions with clear documentation
   - Error handling with custom exceptions

2. **Router Layer Pattern**
   - Thin controllers in `routers/chatbot.py`
   - Pydantic models for validation
   - HTTP exception mapping

3. **Frontend Hook Pattern**
   - Stateful logic in `hooks/useChatbot.js`
   - Separated from presentation
   - Reusable handlers

4. **Presentational Component Pattern**
   - Pure UI in `components/ChatbotInterface.jsx`
   - PropTypes documentation
   - No direct API calls

## Troubleshooting

### "GEMINI_API_KEY is not configured"

**Problem**: The backend can't find your API key.

**Solution**:
1. Ensure `backend/.env` exists
2. Check that `GEMINI_API_KEY` is set correctly
3. Restart the Docker containers: `docker-compose restart`

### Frontend can't connect to backend

**Problem**: CORS or connection errors in browser console.

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check CORS configuration in `backend/app/main.py`
3. Ensure frontend is using correct API base URL

### Messages not showing context

**Problem**: Assistant doesn't remember previous messages.

**Solution**:
1. Check browser console for errors
2. Verify history is being sent in network tab
3. Ensure `useChatbot` hook includes messages in POST request

## Development Workflow

### Making Changes

**Backend changes:**
1. Edit files in `backend/app/`
2. Changes auto-reload (uvicorn --reload)
3. Check logs: `docker-compose logs -f backend`

**Frontend changes:**
1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. Check logs: `docker-compose logs -f frontend`

### Adding Features

Follow the feature workflow documented in `docs/feature-workflow.md`:
1. Create service layer
2. Add router
3. Build frontend hook
4. Create UI component
5. Integrate in App.jsx

## Next Steps

- Add conversation persistence (SQLite or local storage)
- Implement streaming responses for longer replies
- Add conversation history management UI
- Create unit tests for service and router layers
- Add rate limiting for production use
- Implement user authentication
- Add conversation export/import

## Additional Resources

- [Feature Workflow Guide](./feature-workflow.md)
- [Chatbot Feature Documentation](./chatbot-feature.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Hooks Guide](https://react.dev/reference/react)
