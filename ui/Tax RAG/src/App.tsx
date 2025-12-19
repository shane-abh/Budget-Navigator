import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import type { Message, QueryOptimization, Source } from './types'
import { Header, ChatArea, InputArea, RegisterForm, LimitWarning } from './components'
import { useAuth } from './hooks/useAuth'
import { API_BASE_URL } from './config'
import { validateChatInput } from './utils/inputValidation'

/**
 * Decodes HTML entities in a string (e.g., &#x27; -> ')
 * This is needed because the API might send HTML-encoded text
 */
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Create welcome message with user name
const createWelcomeMessage = (name?: string): Message => ({
  content: name 
    ? `Welcome aboard, **${name}**! 🍁\n\nI'm your **Budget 2025 Navigator** — your guide to understanding Canada's fiscal blueprint for the future.\n\nI can help you explore:\n- **Key investments** in housing, infrastructure, and defense\n- **Tax changes** and what they mean for Canadians\n- **Economic projections** and fiscal targets\n- **Program details** across all government initiatives\n\nWhat would you like to know about Budget 2025?`
    : "Welcome to the **Budget 2025 Navigator**! 🍁\n\nI'm here to help you understand Canada's fiscal blueprint. What would you like to explore?",
  isUser: false
});

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentOptimization, setCurrentOptimization] = useState<QueryOptimization | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Handle auth success by showing welcome message
  const handleAuthSuccess = useCallback((name: string | null) => {
    setMessages([createWelcomeMessage(name || undefined)]);
  }, []);

  const { auth, isCheckingAuth, registerError, register, logout, updateAuth } = useAuth({
    onAuthSuccess: handleAuthSuccess,
  });

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Auto-scroll chat area
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, currentAnswer, statusMessage]);

  const handleRegister = useCallback(async (name: string) => {
    await register(name);
  }, [register]);

  const handleLogout = useCallback(async () => {
    await logout();
    // Reset chat state
    setMessages([]);
    setInputValue('');
    setCurrentAnswer('');
    setCurrentOptimization(null);
    setStatusMessage('');
  }, [logout]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || !auth.isAuthenticated) return;

    // Validate input before sending (additional safety check)
    const validation = validateChatInput(message);
    if (!validation.isValid || !validation.sanitized) {
      return; // Validation error should already be shown in InputArea
    }

    const sanitizedMessage = validation.sanitized;

    // Check if questions remaining
    if (auth.questionsRemaining !== null && auth.questionsRemaining <= 0) {
      return;
    }

    // Add user message (use sanitized version)
    setMessages(prev => [...prev, { content: sanitizedMessage, isUser: true }]);
    setInputValue('');
    setIsLoading(true);
    // Decode HTML entities in case the message was already encoded
    setCurrentOptimization({ original: decodeHtmlEntities(sanitizedMessage) });
    setCurrentAnswer('');

    try {
      // Build URL with token for EventSource fallback (use sanitized message)
      let url = `${API_BASE_URL}/chat/stream?message=${encodeURIComponent(sanitizedMessage)}&use_query_expansion=true`;
      if (auth.authToken) {
        url += `&token=${encodeURIComponent(auth.authToken)}`;
      }

      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      // Decode HTML entities in case the message was already encoded
      const optimizationData: QueryOptimization = { original: decodeHtmlEntities(sanitizedMessage) };
      let sourcesData: Source[] = [];
      let totalDocsCount = 0;
      let answerText = '';

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'session':
            updateAuth({
              sessionId: data.session_id,
              questionsRemaining: data.questions_remaining ?? auth.questionsRemaining
            });
            break;

          case 'original_query':
            // Handle the original query from the API
            // Decode HTML entities in case the API sends encoded text
            optimizationData.original = decodeHtmlEntities(data.content);
            setCurrentOptimization({ ...optimizationData });
            break;

          case 'rewritten_query':
            // Decode HTML entities in case the API sends encoded text
            optimizationData.rewritten = decodeHtmlEntities(data.content);
            setCurrentOptimization({ ...optimizationData });
            break;

          case 'expanded_terms':
            optimizationData.expanded = data.terms;
            setCurrentOptimization({ ...optimizationData });
            break;

          case 'sources':
            sourcesData = data.sources;
            totalDocsCount = data.total_docs;
            break;

          case 'status':
            setStatusMessage(data.message);
            break;

          case 'answer_start':
            setStatusMessage('');
            answerText = '';
            setCurrentAnswer('');
            break;

          case 'answer_chunk':
            answerText += data.content;
            setCurrentAnswer(answerText);
            break;

          case 'answer_complete': {
            // Ensure optimization data doesn't contain HTML entities
            const finalOptimization: QueryOptimization = {
              original: decodeHtmlEntities(optimizationData.original),
              ...(optimizationData.rewritten && { rewritten: decodeHtmlEntities(optimizationData.rewritten) }),
              ...(optimizationData.expanded && { expanded: optimizationData.expanded })
            };
            setMessages(prev => [...prev, {
              content: answerText,
              isUser: false,
              optimization: finalOptimization,
              sources: sourcesData,
              totalDocs: totalDocsCount
            }]);
            setCurrentAnswer('');
            setCurrentOptimization(null);
            setStatusMessage('');
            break;
          }

          case 'done':
            eventSource.close();
            setIsLoading(false);
            break;

          case 'error':
            console.error('Error:', data.message);
            setMessages(prev => [...prev, {
              content: `Error: ${data.message}`,
              isUser: false
            }]);
            eventSource.close();
            setIsLoading(false);
            break;
        }
      };

      eventSource.onerror = async (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
        
        // Check if it's an auth error
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (!response.ok) {
            setMessages(prev => [...prev, {
              content: 'Session expired. Please log in again.',
              isUser: false
            }]);
            setTimeout(handleLogout, 2000);
          } else {
            setMessages(prev => [...prev, {
              content: 'Connection error. Please try again.',
              isUser: false
            }]);
          }
        } catch {
          setMessages(prev => [...prev, {
            content: 'Connection error. Please try again.',
            isUser: false
          }]);
        }
      };

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        content: 'Error sending message. Please try again.',
        isUser: false
      }]);
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show registration form if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <RegisterForm 
        onRegister={handleRegister} 
        error={registerError}
      />
    );
  }

  // Show chat interface
  const showLimitWarning = auth.questionsRemaining !== null && auth.questionsRemaining <= 0;

  return (
    <div className="container chat-container">
      <Header 
        userName={auth.userName}
        questionsRemaining={auth.questionsRemaining}
        onLogout={handleLogout}
      />
      
      <ChatArea
        ref={chatAreaRef}
        messages={messages}
        currentOptimization={currentOptimization}
        statusMessage={statusMessage}
        currentAnswer={currentAnswer}
      />

      {showLimitWarning && <LimitWarning onLogout={handleLogout} />}
      
      <InputArea
        inputValue={inputValue}
        isLoading={isLoading || showLimitWarning}
        onInputChange={setInputValue}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

export default App
