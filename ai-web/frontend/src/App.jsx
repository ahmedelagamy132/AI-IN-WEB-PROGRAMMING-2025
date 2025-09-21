import { useState } from 'react';
import { post } from './lib/api';

function App() {
  const [msg, setMsg] = useState('hello');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    setLoading(true);
    setError('');
    try {
      const json = await post('/echo', { msg });
      setResponse(json.msg);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
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
