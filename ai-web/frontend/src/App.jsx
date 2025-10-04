// Application shell responsible for wiring the echo feature into the page.
//
// Lab 02 promotes a feature-focused folder structure. This file stays intentionally
// small so it is easy for students to see how the shared layout composes feature
// modules exported from `src/features`.
import { EchoForm } from './features/echo/components/EchoForm';
import { useEchoForm } from './features/echo/hooks/useEchoForm';

function App() {
  const echoForm = useEchoForm(); // Gather the state and handlers that power the echo feature.

  return (
    <main style={{ padding: 24 }}>
      {/* Spread the hook results onto the presentational component. */}
      <EchoForm {...echoForm} />
    </main>
  );
}

export default App;
