// Lesson outline generator page
import { Link } from 'react-router-dom';
import { LessonOutlineForm } from '../features/gemini/components/LessonOutlineForm';
import { useLessonOutlineForm } from '../features/gemini/hooks/useLessonOutlineForm';

export function LessonOutlinePage() {
  const lessonOutlineForm = useLessonOutlineForm();

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          ← Back to Home
        </Link>
      </nav>

      <header style={{ marginBottom: 32 }}>
        <h1>Gemini Lesson Outline Builder</h1>
        <p style={{ fontSize: 18, color: '#666', maxWidth: 800 }}>
          Generate structured lesson outlines using Google's Gemini AI model.
          Perfect for instructors planning web programming curriculum or students
          organizing their learning path.
        </p>
      </header>

      <div style={{ maxWidth: 600 }}>
        <LessonOutlineForm {...lessonOutlineForm} />
      </div>
    </div>
  );
}
