import sys
import types
from pathlib import Path

import pytest
from fastapi import HTTPException

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.routers.gemini import LessonOutlineIn, lesson_outline
from app.services import gemini as gemini_service


def test_lesson_outline_http_error_includes_exception_fallback(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    gemini_service._configure_client.cache_clear()

    class DummyGenerativeModel:
        def __init__(self, *_args, **_kwargs):
            pass

        def generate_content(self, _prompt):  # pragma: no cover - exercised through router call
            raise RuntimeError()

    dummy_genai = types.SimpleNamespace(
        configure=lambda **_kwargs: None,
        GenerativeModel=DummyGenerativeModel,
    )
    monkeypatch.setattr(gemini_service, "genai", dummy_genai)

    payload = LessonOutlineIn(topic="widgets")

    with pytest.raises(HTTPException) as exc_info:
        lesson_outline(payload)

    error = exc_info.value
    assert error.status_code == 503
    assert error.detail == "Failed to generate lesson outline: RuntimeError."
