# Chatbot Feature Implementation

This document describes the end-to-end chatbot feature that was added to the AI in Web Programming project, following the established feature workflow pattern.

## Overview

The chatbot feature provides a conversational AI interface powered by Gemini, allowing users to have multi-turn conversations with an AI teaching assistant focused on web programming topics.

## Architecture

The implementation follows the same structure as existing features (echo and lesson outline):

### Backend Components

1. **Service Layer** (`app/services/chatbot.py`)
   - Handles core business logic for chat interactions
   - Manages conversation history context
   - Integrates with Gemini API using the same patterns as `gemini.py`
   - Includes comprehensive error handling and documentation

2. **Router Layer** (`app/routers/chatbot.py`)
   - Exposes `/chat/message` endpoint with `/chat` prefix
   - Defines Pydantic models for request/response validation:
     - `ChatMessage`: Individual message schema with role and content
     - `ChatRequest`: Accepts message and optional history array
     - `ChatResponse`: Returns assistant's response
   - Translates domain errors to appropriate HTTP exceptions

3. **Application Registration** (`app/main.py`)
   - Router registered alongside existing routers
   - No additional configuration required

### Frontend Components

1. **Hook** (`frontend/src/features/chatbot/hooks/useChatbot.js`)
   - Manages conversation state with React hooks
   - Maintains full message history array
   - Handles API calls to backend
   - Provides handlers for sending messages and clearing conversation
   - Implements optimistic UI updates

2. **Component** (`frontend/src/features/chatbot/components/ChatbotInterface.jsx`)
   - Presentational component for chat UI
   - Displays message history with user/assistant styling
   - Auto-scrolls to latest message
   - Shows loading indicator while waiting for responses
   - Provides clear conversation button
   - Fully documented with PropTypes

3. **Application Integration** (`frontend/src/App.jsx`)
   - Chatbot section added as third feature demo
   - Follows same composition pattern as other features

## Key Features

### Conversation Context
- Full message history sent with each request
- Backend remains stateless while LLM maintains context
- Clean separation between user and assistant messages

### User Experience
- Optimistic UI updates (user message appears immediately)
- Auto-scroll to latest message
- Visual distinction between user and assistant messages
- Loading indicator during API calls
- Error handling with informative messages
- Clear conversation capability

### Error Handling
- Empty message validation
- API failure recovery (removes failed user message)
- Descriptive error messages
- Backend logging for debugging

## API Endpoint

### POST `/chat/message`

**Request:**
```json
{
  "message": "What is FastAPI?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help you?"}
  ]
}
```

**Response:**
```json
{
  "role": "assistant",
  "content": "FastAPI is a modern, fast web framework for building APIs with Python..."
}
```

## Testing

### Backend Test (Manual)
```bash
# From the project root
curl -X POST http://localhost:8000/chat/message \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Explain React hooks",
    "history": []
  }'
```

### Frontend Test
1. Start the services with `docker-compose up`
2. Navigate to http://localhost:5173
3. Scroll to the "AI Teaching Assistant Chatbot" section
4. Type a message and observe the conversation flow

## Environment Variables

The chatbot uses the same environment variables as other Gemini-powered features:
- `GEMINI_API_KEY`: Required for API access
- `GEMINI_MODEL`: Optional model override (defaults to `gemini-2.5-flash`)

These are configured in `backend/.env` (copied from `backend/.env.example`).

## Code Structure Adherence

This implementation strictly follows the project's established patterns:

✓ Service layer contains business logic with detailed docstrings
✓ Router stays thin and delegates to service
✓ Frontend hook isolates stateful logic
✓ Presentational component focuses on rendering
✓ PropTypes documentation for component interface
✓ Error handling at all layers
✓ Consistent naming conventions
✓ Teaching-focused inline comments
✓ Same API patterns (using `post` from `lib/api.js`)

## Teaching Applications

This chatbot feature demonstrates:
- Stateful conversation management in a stateless backend
- Multi-turn LLM interactions
- React state management for dynamic arrays
- Optimistic UI patterns
- Real-time user feedback
- Clean separation of concerns
- API request/response modeling with Pydantic
- RESTful endpoint design for chat interfaces
