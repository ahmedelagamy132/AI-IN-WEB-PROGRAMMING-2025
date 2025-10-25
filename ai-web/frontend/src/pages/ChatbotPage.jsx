// Dedicated page for the AI chatbot feature
import { Link, useSearchParams } from 'react-router-dom';
import { ChatbotInterface } from '../features/chatbot/components/ChatbotInterface';
import { useChatbot } from '../features/chatbot/hooks/useChatbot';

export function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation_id');
  const chatbot = useChatbot(conversationId);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          ← Back to Home
        </Link>
        <Link to="/conversations" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          📚 View History
        </Link>
      </nav>

      <header style={{ marginBottom: 32 }}>
        <h1>Agamistic Teaching Assistant</h1>
        <p style={{ color: '#555', maxWidth: 800 }}>
          Ask course-related questions about the labs and web programming topics.
          The assistant keeps track of the conversation to provide helpful answers.
        </p>
        {conversationId && (
          <div style={{ 
            marginTop: 12, 
            padding: 8, 
            backgroundColor: '#d4edda', 
            color: '#155724',
            borderRadius: 4,
            fontSize: 14
          }}>
            💾 Conversation is being saved to database (ID: {conversationId.substring(0, 8)}...)
          </div>
        )}
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ChatbotInterface {...chatbot} />
      </div>

    </div>
  );
}
