# Database Architecture Visualization

## System Overview

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    AI WEB PROGRAMMING PLATFORM                ┃
┃                     With Database Integration                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────┐
│                     USER / STUDENT                           │
│                    (Web Browser)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP Requests
                           │ (Port 5173)
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                     FRONTEND                                 │
│                   React + Vite                               │
│              http://localhost:5173                           │
│                                                              │
│  Components:                                                 │
│  ├─ ChatbotInterface (chat UI)                              │
│  ├─ EchoForm (testing)                                      │
│  └─ LessonOutlineForm (AI lessons)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API Calls
                           │ (Port 8000)
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                     BACKEND                                  │
│                  FastAPI + Python                            │
│              http://localhost:8000                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              ROUTERS (API Layer)                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  /echo          - Simple echo endpoint        │  │    │
│  │  │  /ai/lesson     - Gemini lesson generator    │  │    │
│  │  │  /chat/message  - Chatbot with persistence   │  │    │
│  │  │  /conversations - CRUD operations        [NEW]│  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────┐    │
│  │           SERVICES (Business Logic)                │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  echo.py       - Echo service logic          │  │    │
│  │  │  gemini.py     - Gemini API integration      │  │    │
│  │  │  chatbot.py    - Chat conversation logic     │  │    │
│  │  │  lesson_summary.py - Lesson summaries        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────┐    │
│  │          DATABASE LAYER (SQLAlchemy)           [NEW]│    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  database.py   - Connection & session mgmt  │  │    │
│  │  │  models/       - ORM models                 │  │    │
│  │  │    ├─ Conversation (table)                  │  │    │
│  │  │    └─ Message (table)                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────┬───────────────────────────────┘    │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ PostgreSQL Protocol
                        │ (Port 5432)
                        │
┌───────────────────────┴──────────────────────────────────────┐
│                   DATABASE                              [NEW] │
│                PostgreSQL 15                                  │
│               postgresql://localhost:5432                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  TABLE: conversations                              │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  id          VARCHAR(36)   [PK]              │  │    │
│  │  │  title       VARCHAR(255)                    │  │    │
│  │  │  metadata    TEXT                            │  │    │
│  │  │  created_at  TIMESTAMP                       │  │    │
│  │  │  updated_at  TIMESTAMP                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  TABLE: messages                                   │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  id              SERIAL        [PK]          │  │    │
│  │  │  conversation_id VARCHAR(36)   [FK]          │  │    │
│  │  │  role            VARCHAR(20)                 │  │    │
│  │  │  content         TEXT                        │  │    │
│  │  │  created_at      TIMESTAMP                   │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  VOLUME: postgres_data                             │    │
│  │  (Persistent storage)                              │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

                           │
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Google Gemini API                        │    │
│  │       (AI Text Generation)                         │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Saving a Chat Message

```
1. USER types message in browser
        ↓
2. FRONTEND (ChatbotInterface)
   - Captures user input
   - Sends POST to /chat/message
        ↓
3. BACKEND ROUTER (chatbot.py)
   - Receives request
   - Validates with Pydantic
   - Checks conversation exists
        ↓
4. DATABASE LAYER
   - Saves user message to 'messages' table
        ↓
5. SERVICE LAYER (chatbot.py)
   - Builds conversation context
   - Calls Gemini API
        ↓
6. GEMINI API
   - Generates AI response
        ↓
7. SERVICE LAYER
   - Returns AI response
        ↓
8. DATABASE LAYER
   - Saves AI message to 'messages' table
        ↓
9. BACKEND ROUTER
   - Returns response to frontend
        ↓
10. FRONTEND
    - Displays AI response
    - Updates conversation history
```

## Request Flow Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│          │  HTTP   │          │  ORM    │          │
│ Frontend ├────────►│  Router  ├────────►│ Database │
│          │         │          │         │          │
└──────────┘         └────┬─────┘         └──────────┘
                          │
                          │ Business
                          │ Logic
                          │
                     ┌────┴─────┐
                     │          │
                     │ Service  │
                     │          │
                     └────┬─────┘
                          │
                          │ API Call
                          │
                     ┌────┴─────┐
                     │          │
                     │  Gemini  │
                     │   API    │
                     └──────────┘
```

## Docker Compose Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                            │
│                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐│
│  │              │     │              │     │             ││
│  │   frontend   │     │   backend    │     │     db      ││
│  │              │     │              │     │             ││
│  │  React+Vite  │     │   FastAPI    │     │ PostgreSQL  ││
│  │              │     │              │     │             ││
│  │  Port: 5173  │     │  Port: 8000  │     │ Port: 5432  ││
│  │              │     │              │     │             ││
│  └──────┬───────┘     └──────┬───────┘     └─────┬───────┘│
│         │                    │                   │         │
│         │  volumes (src/)    │  volumes (app/)   │ volume  │
│         │                    │                   │(postgres)│
│         └────────────────────┴───────────────────┘         │
│                                                              │
│  Networks: default (bridge)                                 │
│  - frontend can call backend at http://backend:8000         │
│  - backend can call db at postgresql://db:5432              │
└─────────────────────────────────────────────────────────────┘
```

## Database Relationships

```
┌────────────────────────────┐
│      conversations         │
│                            │
│  id: "abc-123"            │◄───┐
│  title: "Python Basics"   │    │
│  created_at: 2025-11-04   │    │
└────────────────────────────┘    │
                                  │ ONE-TO-MANY
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
┌─────────────┴──────────┐     ┌───────────────────────┴──────┐
│      messages          │     │      messages                │
│                        │     │                              │
│  id: 1                │     │  id: 2                      │
│  conversation_id: abc-123   │  conversation_id: abc-123   │
│  role: "user"         │     │  role: "assistant"          │
│  content: "Question?" │     │  content: "Answer!"         │
└────────────────────────┘     └─────────────────────────────┘
```

## API Endpoint Map

```
http://localhost:8000/

├── /health                  [GET]    Health check
│
├── /echo                    [POST]   Echo endpoint
├── /flaky-echo              [POST]   Retry demonstration
│
├── /ai/
│   ├── lesson-outline       [POST]   Generate lesson outline
│   └── lesson-summary       [POST]   Generate lesson summary
│
├── /chat/
│   └── message              [POST]   Chat with AI (+ persistence)
│
└── /conversations/          [NEW: Database Operations]
    ├── /                    [GET]    List all conversations
    ├── /                    [POST]   Create conversation
    ├── /{id}                [GET]    Get conversation details
    ├── /{id}                [DELETE] Delete conversation
    └── /{id}/messages       [POST]   Add message to conversation
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND                                                    │
│  ├─ React 18                                                │
│  ├─ Vite (build tool)                                       │
│  ├─ React Router (navigation)                               │
│  └─ Custom hooks (state management)                         │
│                                                              │
│  BACKEND                                                     │
│  ├─ Python 3.11+                                            │
│  ├─ FastAPI (web framework)                                 │
│  ├─ Uvicorn (ASGI server)                                   │
│  ├─ Pydantic (validation)                                   │
│  ├─ SQLAlchemy (ORM)                              [NEW]     │
│  ├─ Psycopg2 (PostgreSQL driver)                 [NEW]     │
│  └─ Google Generative AI SDK                                │
│                                                              │
│  DATABASE                                         [NEW]     │
│  ├─ PostgreSQL 15                                           │
│  ├─ Alembic (migrations - future)                          │
│  └─ Docker Volume (persistence)                             │
│                                                              │
│  INFRASTRUCTURE                                              │
│  ├─ Docker                                                  │
│  ├─ Docker Compose                                          │
│  └─ Multi-container orchestration                           │
│                                                              │
│  EXTERNAL APIs                                               │
│  └─ Google Gemini AI (text generation)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Development Workflow

```
┌────────────────────┐
│   Code Changes     │
│   (Edit files)     │
└─────────┬──────────┘
          │
          ┌──────────────────────────────────┐
          │  Are you editing Frontend?       │
          └───┬──────────────────────┬───────┘
              │ YES                  │ NO
              │                      │
      ┌───────┴───────┐      ┌──────┴───────┐
      │ Hot Reload    │      │ Hot Reload   │
      │ (Vite)        │      │ (Uvicorn)    │
      │ Instant       │      │ Automatic    │
      └───────┬───────┘      └──────┬───────┘
              │                      │
              └──────────┬───────────┘
                         │
                ┌────────┴────────┐
                │  Test Changes   │
                │  in Browser     │
                └────────┬────────┘
                         │
                ┌────────┴────────┐
                │   All Good?     │
                └───┬─────────┬───┘
                    │ YES     │ NO
                    │         │
            ┌───────┴──┐   ┌─┴──────────┐
            │  Commit  │   │  Continue  │
            │  & Push  │   │  Editing   │
            └──────────┘   └────────────┘
```

## Summary

This architecture provides:

✅ **Separation of Concerns** - Clear layers with specific responsibilities
✅ **Scalability** - Each component can be scaled independently
✅ **Maintainability** - Clean structure makes updates easy
✅ **Educational Value** - Demonstrates real-world patterns
✅ **Persistence** - Database stores data permanently
✅ **Modern Stack** - Current best practices and tools

The database integration adds a critical persistence layer while maintaining the clean architecture that makes this platform excellent for teaching.
