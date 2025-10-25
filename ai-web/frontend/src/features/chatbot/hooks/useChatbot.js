// Hook encapsulating the state management for the chatbot interface.
// Following the same pattern as other feature hooks, this isolates all stateful
// logic so the presentational component stays focused on rendering.
import { useCallback, useState } from 'react';

import { post } from '../../../lib/api';

const ENDPOINT = '/chat/message';

/**
 * Manage the chatbot conversation lifecycle.
 *
 * This hook maintains the full message history in React state and handles
 * sending new messages to the backend. The conversation context allows the
 * LLM to provide coherent multi-turn responses.
 *
 * @returns {object} Handlers and state consumed by the presentational component.
 */
export function useChatbot() {
  // Messages array stores the entire conversation history
  const [messages, setMessages] = useState([]);
  // Input value mirrors the text in the message input field
  const [input, setInput] = useState('');
  // Loading flag lets the UI disable inputs while waiting for the assistant
  const [loading, setLoading] = useState(false);
  // Error message is displayed inline when requests fail
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmedInput = input.trim();
      if (!trimmedInput) {
        setError('Please enter a message.');
        return;
      }

      // Add the user's message to the conversation immediately for better UX
      const userMessage = { role: 'user', content: trimmedInput };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        // Send the message along with conversation history for context
        const response = await post(ENDPOINT, {
          message: trimmedInput,
          history: messages
        });

        // Append the assistant's response to the conversation
        const assistantMessage = {
          role: response.role || 'assistant',
          content: response.content || 'No response received.'
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const detailMessage =
          typeof err?.detail === 'string'
            ? err.detail
            : err instanceof Error && err.message
              ? err.message
              : 'Unknown error';
        setError(detailMessage);
        
        // Remove the user message if the request failed to keep history clean
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        // Always release the loading state so the UI can react
        setLoading(false);
      }
    },
    [input, messages]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setInput('');
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    clearConversation
  };
}
