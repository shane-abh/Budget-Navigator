import { useState, useEffect } from 'react';
import { validateChatInput, sanitizeInput } from '../utils/inputValidation';

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

function InputArea({
  inputValue,
  isLoading,
  onInputChange,
  onSendMessage
}: InputAreaProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validate input on change
  useEffect(() => {
    if (inputValue.trim() && hasAttemptedSubmit) {
      const validation = validateChatInput(inputValue);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [inputValue, hasAttemptedSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize input in real-time to prevent malicious content
    const sanitized = sanitizeInput(value);
    onInputChange(sanitized);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    setHasAttemptedSubmit(true);
    const validation = validateChatInput(inputValue);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }
    
    setError(null);
    setHasAttemptedSubmit(false);
    onSendMessage();
  };

  return (
    <div className="input-area">
      {error && (
        <div className="input-error" role="alert">
          {error}
        </div>
      )}
      <div className="input-container">
        <input
          type="text"
          id="messageInput"
          placeholder="Type your question here..."
          autoComplete="off"
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'input-error' : undefined}
        />
        <button
          id="sendButton"
          onClick={handleSendMessage}
          disabled={isLoading || !!error}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default InputArea;






