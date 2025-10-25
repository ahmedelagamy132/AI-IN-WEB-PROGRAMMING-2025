// Page for viewing and managing conversation history
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (convId) => {
    try {
      const response = await fetch(`http://localhost:8000/conversations/${convId}`);
      if (!response.ok) throw new Error('Failed to load conversation details');
      const data = await response.json();
      setSelectedConv(data);
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteConversation = async (convId) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/conversations/${convId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      // Refresh the list
      loadConversations();
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const createNewConversation = async () => {
    const title = prompt('Enter conversation title:');
    if (!title) return;

    try {
      const response = await fetch('http://localhost:8000/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      const data = await response.json();
      
      // Refresh the list
      loadConversations();
      // Navigate to chatbot with this conversation
      navigate(`/chatbot?conversation_id=${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: 16 }}>
          ← Back to Home
        </Link>
      </nav>

      <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Conversation History</h1>
          <p style={{ color: '#555', maxWidth: 800 }}>
            View and manage your saved conversations with the AI assistant.
          </p>
        </div>
        <button
          onClick={createNewConversation}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          + New Conversation
        </button>
      </header>

      {error && (
        <div style={{
          padding: 16,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: 6,
          marginBottom: 24,
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Conversations List */}
        <div style={{ flex: '0 0 350px' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: 16,
            maxHeight: '70vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Your Conversations</h2>
            
            {loading && <p>Loading conversations...</p>}
            
            {!loading && conversations.length === 0 && (
              <p style={{ color: '#666' }}>No conversations yet. Create your first one!</p>
            )}

            {!loading && conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversationDetails(conv.id)}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: selectedConv?.id === conv.id ? '#007bff' : 'white',
                  color: selectedConv?.id === conv.id ? 'white' : 'black',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #ddd',
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {conv.title || 'Untitled Conversation'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  {conv.message_count} messages
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {new Date(conv.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Details */}
        <div style={{ flex: 1 }}>
          {!selectedConv && (
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              padding: 48,
              textAlign: 'center',
              color: '#666',
            }}>
              <p style={{ fontSize: 18, marginBottom: 12 }}>Select a conversation to view messages</p>
              <p>Click on any conversation from the list to see its full history</p>
            </div>
          )}

          {selectedConv && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: 8,
              border: '1px solid #ddd',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: 16,
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
              }}>
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 4 }}>
                    {selectedConv.title || 'Untitled Conversation'}
                  </h2>
                  <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                    {messages.length} messages • Created {new Date(selectedConv.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate(`/chatbot?conversation_id=${selectedConv.id}`)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={() => deleteConversation(selectedConv.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                padding: 24,
                maxHeight: '60vh',
                overflowY: 'auto',
              }}>
                {messages.length === 0 && (
                  <p style={{ color: '#666', textAlign: 'center' }}>No messages in this conversation</p>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: 8,
                      borderLeft: `4px solid ${msg.role === 'user' ? '#2196f3' : '#4caf50'}`,
                    }}
                  >
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: msg.role === 'user' ? '#1976d2' : '#388e3c',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 Agamy'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
