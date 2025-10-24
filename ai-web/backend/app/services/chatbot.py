"""Service helpers for a conversational chatbot powered by Gemini.

This module demonstrates how to build a stateful chatbot feature that maintains
conversation history across multiple turns. Following the same teaching pattern
as the other service modules, each function is heavily documented so instructors
can walk through the implementation during labs.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import List

# Import the Gemini SDK lazily so unit tests (or classrooms without credentials)
# can still import the module and read through the teaching notes.
try:
    import google.generativeai as genai
except ImportError as exc:  # pragma: no cover - handled during runtime usage.
    genai = None  # type: ignore[assignment]
    _IMPORT_ERROR = exc
else:
    _IMPORT_ERROR = None


class ChatbotServiceError(RuntimeError):
    """Raised when the chatbot service cannot fulfill a request."""


def _require_api_key() -> str:
    """Read the API key from the environment and raise a descriptive error.

    The helper keeps API key access in one place so the error message remains
    consistent every time an instructor demonstrates a misconfigured setup.
    """

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ChatbotServiceError(
            "GEMINI_API_KEY is not configured. Add it to backend/.env before calling the service."
        )
    return api_key


@lru_cache(maxsize=1)
def _configure_client(api_key: str) -> bool:
    """Configure the global Gemini client once per process.

    The return value is a simple boolean so callers can ignore the result and
    focus on the fact that the client has been prepared for use.
    """

    if genai is None:  # pragma: no cover - depends on optional dependency.
        raise ChatbotServiceError(
            "google-generativeai is not installed. Run `pip install google-generativeai` to enable the feature."
        ) from _IMPORT_ERROR

    genai.configure(api_key=api_key)
    return True


def _build_conversation_context(history: List[dict[str, str]]) -> str:
    """Convert message history into a formatted context string for the model.

    Args:
        history: List of message dictionaries containing 'role' and 'content'.

    Returns:
        A formatted string representing the conversation history.
    """

    if not history:
        return ""

    context_parts = []
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            context_parts.append(f"User: {content}")
        elif role == "assistant":
            context_parts.append(f"Assistant: {content}")
    
    return "\n".join(context_parts)


def _clean_response_text(raw_text: str) -> str:
    """Clean and format the Gemini response for better readability.

    This function removes unnecessary formatting artifacts, fixes spacing,
    and ensures consistent output quality for the frontend.

    Args:
        raw_text: The raw text response from Gemini.

    Returns:
        Cleaned and formatted response text.
    """

    if not raw_text:
        return ""

    # Remove excessive whitespace and normalize line breaks
    cleaned = raw_text.strip()
    
    # Replace multiple consecutive newlines with double newline (paragraph breaks)
    import re
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in cleaned.split('\n')]
    cleaned = '\n'.join(lines)
    
    # Fix common formatting issues from Gemini responses
    # Remove asterisks used for bold in markdown if they appear inconsistently
    # cleaned = re.sub(r'\*\*([^*]+)\*\*', r'\1', cleaned)  # Uncomment to remove bold
    
    # Ensure proper spacing after periods and commas
    cleaned = re.sub(r'\.([A-Z])', r'. \1', cleaned)
    cleaned = re.sub(r',([A-Za-z])', r', \1', cleaned)
    
    # Remove any leading/trailing special characters that might have slipped through
    cleaned = cleaned.strip('*-_')
    
    return cleaned


def send_chat_message(
    message: str,
    history: List[dict[str, str]] | None = None,
    model: str | None = None
) -> dict[str, str]:
    """Send a message to the chatbot and get a response with conversation context.

    Args:
        message: The user's message to send to the chatbot.
        history: Optional list of previous messages to provide context. Each
            message should be a dict with 'role' ('user' or 'assistant') and
            'content' (the message text).
        model: Optional override so the labs can experiment with different
            Gemini releases. Defaults to ``GEMINI_MODEL`` or ``gemini-2.5-flash``.

    Returns:
        Dictionary containing the assistant's response with a 'role' and 'content'
        field matching the structure expected by the frontend.

    Raises:
        ValueError: If the message is empty after trimming whitespace.
        ChatbotServiceError: When credentials are missing, the SDK is not
            installed, or the Gemini API reports an error.
    """

    normalized_message = message.strip()
    if not normalized_message:
        raise ValueError("Message must not be empty.")

    api_key = _require_api_key()
    _configure_client(api_key)  # Cache-aware setup keeps repeated requests fast.

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    try:
        generative_model = genai.GenerativeModel(selected_model)
        
        # Build the full prompt including conversation history and system instructions
        system_prompt = (
            "You are a helpful AI teaching assistant for a web programming course. "
            "Provide clear, well-structured answers about web development, AI integration, "
            "FastAPI, React, and related technologies. "
            "\n\nGuidelines:"
            "\n- Keep responses concise and educational"
            "\n- Use proper formatting with clear paragraphs"
            "\n- When listing items, use clear numbering or bullet points"
            "\n- Avoid excessive markdown formatting"
            "\n- Focus on practical, actionable information"
            "\n- Stay relevant to web programming topics"
        )
        
        # Include conversation history if provided
        conversation_context = _build_conversation_context(history or [])
        
        if conversation_context:
            full_prompt = f"{system_prompt}\n\n{conversation_context}\nUser: {normalized_message}\nAssistant:"
        else:
            full_prompt = f"{system_prompt}\n\nUser: {normalized_message}\nAssistant:"
        
        response = generative_model.generate_content(full_prompt)
        response_text = getattr(response, "text", "").strip()
        
        if not response_text:
            response_text = "I apologize, but I couldn't generate a response. Please try again."
        else:
            # Clean and format the response for better readability
            response_text = _clean_response_text(response_text)
            
    except Exception as exc:  # pragma: no cover - depends on remote API.
        raw_message = str(exc).strip()
        if raw_message:
            detail = f": {raw_message}"
        else:
            fallback = exc.__class__.__name__
            detail = f": {fallback}"
        raise ChatbotServiceError(
            f"Failed to generate chatbot response{detail}."
        ) from exc

    return {"role": "assistant", "content": response_text}
