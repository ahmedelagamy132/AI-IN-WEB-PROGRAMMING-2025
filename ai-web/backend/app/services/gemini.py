"""Service helpers for Gemini-powered features exposed by the FastAPI app.

The teaching labs encourage a service layer that contains the business logic
for each feature. Routers stay thin while services interact with third-party
SDKs or databases. This module demonstrates that pattern for Gemini requests
and is annotated line-by-line so instructors can explain each operation in
class.
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


class GeminiServiceError(RuntimeError):
    """Raised when the Gemini helper cannot fulfill a request."""


def _require_api_key() -> str:
    """Read the API key from the environment and raise a descriptive error.

    The helper keeps API key access in one place so the error message remains
    consistent every time an instructor demonstrates a misconfigured setup.
    """

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiServiceError(
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
        raise GeminiServiceError(
            "google-generativeai is not installed. Run `pip install google-generativeai` to enable the feature."
        ) from _IMPORT_ERROR

    genai.configure(api_key=api_key)
    return True


def _parse_outline_lines(raw_outline: str) -> List[str]:
    """Convert the model response into a clean list of outline bullet points.

    This mirrors what instructors explain in the Lab 03 notebook: Gemini often
    returns Markdown bullets or numbered steps that the UI should present as
    plain text list items.
    """

    lines: List[str] = []
    for line in raw_outline.splitlines():
        cleaned = line.strip()
        if not cleaned:
            continue
        # Remove leading numbering/bullet characters that models often return.
        cleaned = cleaned.lstrip("-*•0123456789. \t")
        if cleaned:
            lines.append(cleaned)
    return lines


def generate_lesson_outline(topic: str, model: str | None = None) -> dict[str, str | list[str]]:
    """Generate a course outline for the requested topic using Gemini.

    Args:
        topic: Instructor-provided lesson topic from the frontend form.
        model: Optional override so the labs can experiment with different
            Gemini releases. Defaults to ``GEMINI_MODEL`` or ``gemini-2.5-flash``.

    Returns:
        Dictionary containing the normalized topic string and a list of outline
        bullet points. The structure matches the response model defined in
        ``app/routers/gemini.py``.

    Raises:
        ValueError: If the topic is empty after trimming whitespace.
        GeminiServiceError: When credentials are missing, the SDK is not
            installed, or the Gemini API reports an error.
    """

    normalized_topic = topic.strip()
    if not normalized_topic:
        raise ValueError("Topic must not be empty.")

    api_key = _require_api_key()
    _configure_client(api_key)  # Cache-aware setup keeps repeated requests fast.

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    try:
        generative_model = genai.GenerativeModel(selected_model)
        prompt = (
            "You are helping an instructor design a web programming lesson. "
            "Return a concise outline with 3-5 bullet points that cover the key "
            "concepts for the topic: "
            f"{normalized_topic}."
        )
        response = generative_model.generate_content(prompt)
        outline_text = getattr(response, "text", "").strip()
    except Exception as exc:  # pragma: no cover - depends on remote API.
        raw_message = str(exc).strip()
        if raw_message:
            detail = f": {raw_message}"
        else:
            fallback = exc.__class__.__name__
            detail = f": {fallback}"
        raise GeminiServiceError(
            f"Failed to generate lesson outline{detail}."
        ) from exc

    outline = _parse_outline_lines(outline_text) if outline_text else []
    return {"topic": normalized_topic, "outline": outline}
