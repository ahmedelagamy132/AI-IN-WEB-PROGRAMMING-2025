#!/usr/bin/env python3
"""Quick validation script for the chatbot feature.

This script tests the chatbot service and router to ensure they work correctly
before deploying to the live environment. Run this from the backend directory.
"""

import sys
from unittest.mock import MagicMock, patch

# Mock the genai module before importing our services
mock_genai = MagicMock()
sys.modules['google.generativeai'] = mock_genai

from app.services.chatbot import send_chat_message, ChatbotServiceError
from app.routers.chatbot import ChatRequest, ChatMessage


def test_service_layer():
    """Test the chatbot service with a mock Gemini response."""
    print("Testing service layer...")
    
    # Mock the Gemini API response
    mock_response = MagicMock()
    mock_response.text = "FastAPI is a modern web framework for Python."
    
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    
    # Set a fake API key
    with patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key'}):
        result = send_chat_message(
            message="What is FastAPI?",
            history=[
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
        )
    
    assert result['role'] == 'assistant'
    assert len(result['content']) > 0
    print("✓ Service layer works correctly")


def test_empty_message_validation():
    """Test that empty messages are rejected."""
    print("Testing empty message validation...")
    
    try:
        send_chat_message(message="   ")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "must not be empty" in str(e)
        print("✓ Empty message validation works")


def test_request_models():
    """Test Pydantic request/response models."""
    print("Testing request models...")
    
    # Test ChatMessage model
    msg = ChatMessage(role="user", content="Hello")
    assert msg.role == "user"
    assert msg.content == "Hello"
    
    # Test ChatRequest with history
    req = ChatRequest(
        message="Test message",
        history=[
            ChatMessage(role="user", content="Hi"),
            ChatMessage(role="assistant", content="Hello!")
        ]
    )
    assert req.message == "Test message"
    assert len(req.history) == 2
    print("✓ Request models work correctly")


def test_conversation_context_building():
    """Test that conversation history is properly formatted."""
    print("Testing conversation context building...")
    
    from app.services.chatbot import _build_conversation_context
    
    history = [
        {"role": "user", "content": "What is React?"},
        {"role": "assistant", "content": "React is a JavaScript library."},
        {"role": "user", "content": "What about hooks?"}
    ]
    
    context = _build_conversation_context(history)
    assert "User: What is React?" in context
    assert "Assistant: React is a JavaScript library." in context
    assert "User: What about hooks?" in context
    print("✓ Conversation context building works")


if __name__ == "__main__":
    print("=" * 60)
    print("Chatbot Feature Validation")
    print("=" * 60)
    print()
    
    try:
        test_service_layer()
        test_empty_message_validation()
        test_request_models()
        test_conversation_context_building()
        
        print()
        print("=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Ensure GEMINI_API_KEY is set in backend/.env")
        print("2. Start services: docker-compose up")
        print("3. Test endpoint: curl -X POST http://localhost:8000/chat/message \\")
        print("     -H 'Content-Type: application/json' \\")
        print("     -d '{\"message\": \"Hello\", \"history\": []}'")
        print("4. Open frontend: http://localhost:5173")
        
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
