// Presentational component that renders the Gemini lesson outline form.
// Keeps UI concerns separate from data fetching so the hook can focus on state.
import PropTypes from 'prop-types';

/**
 * Render the lesson outline form and its derived UI states.
 *
 * @param {object} props - Values provided by `useLessonOutlineForm`.
 * @param {string} props.topic - Current topic text, kept controlled via state.
 * @param {Function} props.setTopic - Setter that updates the topic field.
 * @param {string[]} props.outline - Outline bullets returned by the backend.
 * @param {boolean} props.loading - Flag that disables inputs while waiting on the API.
 * @param {string|null} props.error - Error message to show when the request fails.
 * @param {Function} props.handleSubmit - Form submit handler injected from the hook.
 */
export function LessonOutlineForm({ topic, setTopic, outline, loading, error, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      {/* Provide context so the user knows why the form exists. */}
      <p>
        Generate a quick lesson outline powered by Gemini. Provide a topic, submit
        the form, and discuss the generated talking points with your class.
      </p>

      {/* Controlled input: value comes from React state, edits go through setTopic. */}
      <label style={{ display: 'grid', gap: 4 }}>
        <span>Lesson topic</span>
        <input
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Building resilient web APIs"
          disabled={loading}
          required
        />
      </label>

      {/* Disable the submit button while loading or when the field is empty. */}
      <button type="submit" disabled={loading || !topic.trim()}>
        {loading ? 'Generating outline…' : 'Generate outline'}
      </button>

      {/* Surface backend failures inline so the user can take action. */}
      {error && (
        <p style={{ color: 'crimson' }}>
          {error}. Confirm the backend has access to <code>GEMINI_API_KEY</code>.
        </p>
      )}

      {/* Render the outline when the request succeeds. */}
      {outline.length > 0 && (
        <ol>
          {outline.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ol>
      )}
    </form>
  );
}

LessonOutlineForm.propTypes = {
  topic: PropTypes.string.isRequired,
  setTopic: PropTypes.func.isRequired,
  outline: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired
};

LessonOutlineForm.defaultProps = {
  error: null
};
