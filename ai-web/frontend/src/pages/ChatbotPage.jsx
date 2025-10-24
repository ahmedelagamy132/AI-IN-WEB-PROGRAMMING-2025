// Dedicated page for the AI chatbot feature
import { Link } from 'react-router-dom';
import { ChatbotInterface } from '../features/chatbot/components/ChatbotInterface';
import { useChatbot } from '../features/chatbot/hooks/useChatbot';

export function ChatbotPage() {
  const chatbot = useChatbot();

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          ← Back to Home
        </Link>
      </nav>

      <header style={{ marginBottom: 32 }}>
        <h1>AI Teaching Assistant Chatbot</h1>
   
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ChatbotInterface {...chatbot} />
      </div>


    </div>
  );
}
