# Setup Guide

This guide will help you set up the AI-IN-WEB-PROGRAMMING-2025 project after cloning the repository.

## Prerequisites

- Docker and Docker Compose installed
- A Google Gemini API key (free to obtain)

## Quick Setup

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

The repository includes a template file. You need to create your own `.env` file:

```bash
# Navigate to the backend directory
cd ai-web/backend

# Copy the example file (Linux/Mac)
cp .env.example .env

# OR for Windows Command Prompt
copy .env.example .env

# OR for Windows PowerShell
Copy-Item .env.example .env
```

### 3. Add Your API Key

Open `ai-web/backend/.env` in a text editor and replace `your_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=AIzaSyC...your_actual_key_here...
```

### 4. Start the Application

From the `ai-web` directory:

```bash
docker compose up
```

Or to run in the background:

```bash
docker compose up -d
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Error: "env file ... not found"

**Problem**: The `.env` file doesn't exist in the `backend` directory.

**Solution**: Follow step 2 above to create the `.env` file from the `.env.example` template.

### Error: "GEMINI_API_KEY is not configured"

**Problem**: The `.env` file exists but doesn't contain a valid API key.

**Solution**: 
1. Make sure you replaced `your_api_key_here` with your actual API key
2. Restart the backend container: `docker compose restart backend`

### Port Already in Use

**Problem**: Ports 5173 or 8000 are already occupied.

**Solution**: Either:
- Stop the service using those ports
- Modify `docker-compose.yml` to use different ports

### Docker Daemon Not Running

**Problem**: Docker commands fail with connection errors.

**Solution**: Start Docker Desktop or the Docker daemon on your system.

## Development Workflow

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs backend -f

# Frontend only
docker compose logs frontend -f
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart backend only (useful after changing .env)
docker compose restart backend
```

### Stop Services

```bash
docker compose down
```

### Rebuild After Changes

```bash
docker compose up --build
```

## Project Structure

```
ai-web/
├── backend/
│   ├── .env          # Your environment variables (not in git)
│   ├── .env.example  # Template for environment variables
│   ├── app/          # FastAPI application code
│   └── Dockerfile
├── frontend/
│   ├── src/          # React application code
│   └── Dockerfile
└── docker-compose.yml # Container orchestration
```

## Next Steps

1. Read the main [README.md](README.md) for project overview
2. Explore the lab notebooks in `ai-web/labs/`
3. Check out the API documentation at http://localhost:8000/docs
4. Try the chatbot and other features in the frontend

## Security Notes

- **Never commit your `.env` file** - It contains your API key
- The `.env` file is already in `.gitignore`
- The `.env.example` file is safe to commit as a template
- Keep your Gemini API key private

## Getting Help

If you encounter issues not covered here:

1. Check the error messages in the Docker logs
2. Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Ensure Docker and Docker Compose are up to date
4. Review the lab notebooks for additional guidance

---

**Happy Coding! 🚀**
