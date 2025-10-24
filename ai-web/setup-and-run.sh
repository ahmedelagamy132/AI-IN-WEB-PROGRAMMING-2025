#!/bin/bash
# Quick setup script for the chatbot feature

echo "================================================"
echo "Chatbot Feature Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
fi

# Check if API key is set
if ! grep -q "GEMINI_API_KEY=.\+" backend/.env; then
    echo ""
    echo "⚠️  GEMINI_API_KEY is not configured!"
    echo ""
    echo "To get your Gemini API key:"
    echo "1. Visit: https://aistudio.google.com/app/apikey"
    echo "2. Create or copy your API key"
    echo "3. Add it to backend/.env"
    echo ""
    echo "Opening backend/.env file for you to edit..."
    echo ""
    echo "Add your key like this:"
    echo "GEMINI_API_KEY=your_actual_key_here"
    echo ""
    read -p "Press Enter after you've added your API key..."
fi

echo ""
echo "================================================"
echo "Starting Docker containers..."
echo "================================================"
echo ""

# Stop any existing containers
docker-compose down

# Build and start containers
docker-compose up --build

