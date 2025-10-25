import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

function formatMessageContent(content) {
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    
    // Handle code blocks
    if (trimmed.startsWith('```') || trimmed.startsWith('    ')) {
      return (
        <pre
          key={idx}
          style={{
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '14px',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: '13px',
            margin: '8px 0',
            border: '1px solid #334155',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
          }}
        >
          <code>{trimmed.replace(/```\w*\n?/g, '').trim()}</code>
        </pre>
      );
    }
    
    // Parse inline markdown formatting
    const formatInlineMarkdown = (text) => {
      const parts = [];
      let lastIndex = 0;
      let key = 0;
      
      // Regular expressions for markdown patterns
      const patterns = [
        { regex: /\*\*(.+?)\*\*/g, tag: 'strong' },        // **bold**
        { regex: /\*(.+?)\*/g, tag: 'em' },                 // *italic*
        { regex: /`(.+?)`/g, tag: 'code' }                  // `code`
      ];
      
      // Create a combined regex to find all patterns
      const combinedRegex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
      let match;
      
      while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        // Determine which pattern matched and add formatted content
        if (match[0].startsWith('**')) {
          parts.push(<strong key={key++}>{match[2]}</strong>);
        } else if (match[0].startsWith('`')) {
          parts.push(
            <code 
              key={key++} 
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.9em',
                fontFamily: "'JetBrains Mono', 'Courier New', monospace"
              }}
            >
              {match[4]}
            </code>
          );
        } else if (match[0].startsWith('*')) {
          parts.push(<em key={key++}>{match[3]}</em>);
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : text;
    };
    
    // Handle bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <li 
          key={idx} 
          style={{ 
            margin: '4px 0', 
            lineHeight: '1.6',
            marginLeft: '20px'
          }}
        >
          {formatInlineMarkdown(trimmed.substring(2))}
        </li>
      );
    }
    
    // Handle numbered lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      return (
        <li 
          key={idx} 
          style={{ 
            margin: '4px 0', 
            lineHeight: '1.6',
            marginLeft: '20px'
          }}
        >
          {formatInlineMarkdown(numberedMatch[2])}
        </li>
      );
    }
    
    // Handle headers
    if (trimmed.startsWith('# ')) {
      return (
        <h3 
          key={idx} 
          style={{ 
            margin: '12px 0 8px 0', 
            fontSize: '1.1em',
            fontWeight: '600'
          }}
        >
          {formatInlineMarkdown(trimmed.substring(2))}
        </h3>
      );
    }
    
    // Regular paragraphs
    return (
      <p key={idx} style={{ margin: '8px 0', lineHeight: '1.6' }}>
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  }).filter(Boolean);
}

export function ChatbotInterface({
  messages,
  input,
  setInput,
  loading,
  error = null,
  sendMessage,
  clearConversation
}) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendMessage(e);
    }
  };

  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        height: '700px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                letterSpacing: '-0.02em'
              }}>
                AI Teaching Assistant
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                opacity: 0.9,
                marginTop: '2px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#4ade80',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></span>
                Online
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              disabled={loading}
              title="Clear conversation"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 24px',
            fontSize: '14px',
            borderBottom: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#94a3b8',
              textAlign: 'center',
              gap: '12px'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#64748b' }}>
                  Start a conversation
                </p>
                {/* <p style={{ fontSize: '14px', margin: 0 }}>
                  Ask me anything about web development, React, FastAPI, or course topics
                </p> */}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fadeIn 0.3s ease-in'
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: '16px',
                wordWrap: 'break-word',
                position: 'relative',
                ...(msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderBottomRightRadius: '4px'
                } : {
                  background: 'white',
                  color: '#1e293b',
                  borderBottomLeftRadius: '4px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                })
              }}>
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '4px'
                }}>
                  {formatMessageContent(msg.content)}
                </div>
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  textAlign: 'right'
                }}>
                  {formatTime()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '16px',
                borderRadius: '16px',
                borderBottomLeftRadius: '4px',
                background: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'typing 1.4s infinite'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'typing 1.4s infinite',
                  animationDelay: '0.2s'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'typing 1.4s infinite',
                  animationDelay: '0.4s'
                }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div style={{
          padding: '20px 24px',
          background: 'white',
          borderTop: '1px solid #e2e8f0'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 18px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                backgroundColor: loading ? '#f8fafc' : 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '48px',
                height: '48px',
                background: (loading || !input.trim())
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        *::-webkit-scrollbar {
          width: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
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
