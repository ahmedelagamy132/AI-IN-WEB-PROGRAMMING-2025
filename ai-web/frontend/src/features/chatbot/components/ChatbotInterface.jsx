// Presentational component that renders the chatbot conversation interface.
// Following the same separation-of-concerns pattern as other features, this
// component focuses purely on UI while the hook manages all state and logic.
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

/**
 * Format message content for better display.
 * Handles line breaks, lists, and code snippets.
 */
function formatMessageContent(content) {
  // Split into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    
    // Check if it's a code block (indented or starting with code markers)
    if (trimmed.startsWith('```') || trimmed.startsWith('    ')) {
      return (
        <pre
          key={idx}
          style={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '8px',
            borderRadius: 4,
            overflow: 'auto',
            fontSize: '13px',
            margin: '8px 0'
          }}
        >
          {trimmed.replace(/```\w*\n?/g, '').trim()}
        </pre>
      );
    }
    
    // Regular paragraph with preserved line breaks
    return (
      <p key={idx} style={{ margin: '8px 0', lineHeight: '1.5' }}>
        {trimmed}
      </p>
    );
  }).filter(Boolean);
}

/**
 * Render the chatbot interface with message history and input controls.
 *
 * @param {object} props - Values provided by `useChatbot`.
 * @param {Array} props.messages - Array of message objects with 'role' and 'content'.
 * @param {string} props.input - Current input text, kept controlled via state.
 * @param {Function} props.setInput - Setter that updates the input field.
 * @param {boolean} props.loading - Flag that disables inputs while waiting on the API.
 * @param {string|null} props.error - Error message to show when requests fail.
 * @param {Function} props.sendMessage - Form submit handler injected from the hook.
 * @param {Function} props.clearConversation - Handler to reset the conversation.
 */
export function ChatbotInterface({
  messages,
  input,
  setInput,
  loading,
  error,
  sendMessage,
  clearConversation
}) {
  // Auto-scroll to the bottom when new messages arrive
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 800 }}>
      {/* Provide context so users understand the chatbot's purpose */}
      <p>
        Chat with an AI teaching assistant powered by Gemini. Ask questions about
        web programming, FastAPI, React, or any related topics covered in the course.
        The assistant maintains conversation context across multiple messages.
      </p>

      {/* Message history display */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 16,
          minHeight: 300,
          maxHeight: 500,
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No messages yet. Start a conversation by typing a message below.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: message.role === 'user' ? '#007bff' : '#f0f0f0',
              color: message.role === 'user' ? '#fff' : '#333',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              fontSize: 11, 
              fontWeight: 'bold', 
              marginBottom: 6,
              opacity: 0.8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {formatMessageContent(message.content)}
            </div>
          </div>
        ))}

        {/* Loading indicator shown while waiting for assistant response */}
        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '70%',
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: '#e9ecef',
              fontStyle: 'italic',
              color: '#666'
            }}
          >
            Assistant is typing...
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <p style={{ color: 'crimson' }}>
          {error}. Confirm the backend has access to <code>GEMINI_API_KEY</code>.
        </p>
      )}

      {/* Message input form */}
      <form onSubmit={sendMessage} style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            style={{ flex: 1, padding: 8 }}
            required
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Clear conversation button */}
      {messages.length > 0 && (
        <button
          type="button"
          onClick={clearConversation}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Clear conversation
        </button>
      )}
    </div>
  );
}

ChatbotInterface.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  input: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  sendMessage: PropTypes.func.isRequired,
  clearConversation: PropTypes.func.isRequired
};

ChatbotInterface.defaultProps = {
  error: null
};
