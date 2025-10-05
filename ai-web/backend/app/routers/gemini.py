"""API routes that expose Gemini-backed helpers to the frontend.

The notebook for Lab 03 walks through this module line-by-line, so each section
includes commentary that instructors can echo while teaching the flow.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, constr

from app.services.gemini import GeminiServiceError, generate_lesson_outline

# Prefix the router with /ai so every Gemini-powered endpoint is grouped
# together in the automatically generated FastAPI docs.
router = APIRouter(prefix="/ai", tags=["ai"])


logger = logging.getLogger(__name__)


class LessonOutlineIn(BaseModel):
    """Request schema describing the lesson topic submitted by the frontend."""

    topic: constr(strip_whitespace=True, min_length=1)  # type: ignore[valid-type]


class LessonOutlineOut(BaseModel):
    """Response schema returned to the frontend."""

    topic: str
    outline: list[str]


@router.post("/lesson-outline", response_model=LessonOutlineOut)
def lesson_outline(payload: LessonOutlineIn) -> LessonOutlineOut:
    """Delegate the heavy lifting to the Gemini service layer."""

    try:
        result = generate_lesson_outline(payload.topic)
    except ValueError as exc:
        # Map validation issues (such as an empty topic) to an HTTP 422 so the
        # frontend can display a friendly inline error message.
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except GeminiServiceError as exc:
        # Log the full stack trace for instructors while returning a concise
        # error payload to the browser.
        logger.exception("Gemini lesson outline request failed")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return LessonOutlineOut(**result)
