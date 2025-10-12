// Hook encapsulating the state management for the Gemini lesson outline form.
// Isolate fetch logic inside hooks so presentational components stay easy to reuse.
import { useCallback, useState } from 'react';

import { post } from '../../../lib/api';

const ENDPOINT = '/ai/lesson-outline';

/**
 * Manage the lesson outline form lifecycle.
 *
 * @returns {object} Handlers and state consumed by the presentational component.
 */
export function useLessonOutlineForm() {
  // Topic text mirrors the value inside the text input.
  const [topic, setTopic] = useState('');
  // Outline array renders an ordered list once Gemini responds.
  const [outline, setOutline] = useState([]);
  // Loading flag lets the UI disable the form and show progress copy.
  const [loading, setLoading] = useState(false);
  // Error message is displayed inline near the submit button.
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmedTopic = topic.trim();
      if (!trimmedTopic) {
        setError('Please enter a topic.');
        setOutline([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // POST to the FastAPI proxy so the browser never touches the Gemini key directly.
        const response = await post(ENDPOINT, { topic: trimmedTopic });
        setOutline(Array.isArray(response.outline) ? response.outline : []);
      } catch (err) {
        setOutline([]);
        const detailMessage =
          typeof err?.detail === 'string'
            ? err.detail
            : err instanceof Error && err.message
              ? err.message
              : 'Unknown error';
        setError(detailMessage);
      } finally {
        // Always release the loading state so the UI can react to the outcome.
        setLoading(false);
      }
    },
    [topic]
  );

  return {
    topic,
    setTopic,
    outline,
    loading,
    error,
    handleSubmit
  };
}
