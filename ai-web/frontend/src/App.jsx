import { useState } from 'react'; // Pull in React's state hook to manage component data.
import { post } from './lib/api'; // Import the API helper that wraps fetch for POST requests.
import { withRetry } from './lib/retry'; // Bring in the retry utility you created in Step 1.

function App() { // Declare the main application component rendered by Vite.
  const [msg, setMsg] = useState('hello'); // Track the message that the user wants to send to the backend.
  const [response, setResponse] = useState(''); // Store the echoed response returned by the API.
  const [loading, setLoading] = useState(false); // Represent whether a request is in progress so the UI can disable controls.
  const [error, setError] = useState(''); // Hold a user-facing error message if all retries fail.

  async function handleSend(event) { // Handle the form submission so we can prevent the default browser behavior.
    event.preventDefault(); // Stop the browser from refreshing the page when the form is submitted.
    setLoading(true); // Show the loading state while the request is running.
    setError(''); // Clear any previous error message before retrying.
    setResponse(''); // Reset the prior response so stale data is not displayed.
    try {
      const json = await withRetry(() => post('/echo', { msg }), 2, 500); // Attempt the POST request with up to two retries and a 500 ms delay.
      setResponse(json.msg); // Store the echoed message if the request eventually succeeds.
    } catch (err) {
      setError('A temporary issue was encountered. Please try again.'); // Present a friendly message if every retry fails.
    } finally {
      setLoading(false); // Stop the loading indicator regardless of success or failure.
    }
  }

  return (
    <main style={{ padding: 24 }}> {/* Provide basic padding so the layout has breathing room. */}
      <h1>Lab 2 — Echo with retries</h1> {/* Update the heading to reflect the new behavior in this lab. */}
      <form onSubmit={handleSend} style={{ display: 'grid', gap: 12, maxWidth: 360 }}> {/* Use a simple grid layout for the form controls. */}
        <label htmlFor="msg"> {/* Associate the label with the text input for accessibility. */}
          Message to echo
        </label>
        <input
          id="msg"
          value={msg}
          onChange={(event) => setMsg(event.target.value)}
          disabled={loading}
        /> {/* Bind the input to component state so the typed message is tracked. */}
        <button type="submit" disabled={loading}> {/* Submit the form and disable the button when loading. */}
          {loading ? 'Sending…' : 'Send'} {/* Swap button text based on the loading state. */}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show a user-friendly error when retries fail. */}
      {response && (
        <section>
          <h2>Server response</h2>
          <pre>{response}</pre>
        </section>
      )} {/* Render the echoed message with a subheading when available. */}
    </main>
  );
}

export default App; // Export the component so main.jsx can render it.
