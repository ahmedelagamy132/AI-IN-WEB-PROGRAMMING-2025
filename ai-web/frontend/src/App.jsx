import { useState } from 'react';
import { post } from './lib/api';

// Demo UI that lets students type a message and see the backend echo it back.
function App() {
  const [msg, setMsg] = useState('hello'); // Track the text typed into the input.
  const [response, setResponse] = useState(''); // Hold the echoed value to display.
  const [loading, setLoading] = useState(false); // Flag while awaiting a network response.
  const [error, setError] = useState(''); // Capture any error text to show the user.

  async function handleSend() {
    setLoading(true); // Indicate work is in progress and disable the button.
    setError(''); // Clear prior errors before attempting a new request.
    try {
      const json = await post('/echo', { msg }); // Call the FastAPI echo endpoint.
      setResponse(json.msg); // Update UI with the message returned by the server.
    } catch (err) {
      setError(String(err)); // Surface the failure so students can debug issues.
    } finally {
      setLoading(false); // Always release the loading state.
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Lab 1 — Echo demo</h1>
      <input value={msg} onChange={(event) => setMsg(event.target.value)} />
      <button onClick={handleSend} disabled={loading}>Send</button>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <pre>{response}</pre>
    </main>
  );
}

export default App;
