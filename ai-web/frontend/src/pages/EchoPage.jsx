// Echo service demo page
import { Link } from 'react-router-dom';
import { EchoForm } from '../features/echo/components/EchoForm';
import { useEchoForm } from '../features/echo/hooks/useEchoForm';

export function EchoPage() {
  const echoForm = useEchoForm();

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          ← Back to Home
        </Link>
      </nav>

      <header style={{ marginBottom: 32 }}>
        <h1>Retrying Echo Service</h1>
        <p style={{ fontSize: 18, color: '#666', maxWidth: 800 }}>
          This demo shows how to implement retry logic for handling transient failures
          in API calls. The backend can be configured to fail a certain number of times
          before succeeding, allowing you to test retry behavior.
        </p>
      </header>

      <div style={{ maxWidth: 600 }}>
        <EchoForm {...echoForm} />
      </div>
    </div>
  );
}
