import { useState, useEffect } from 'react';
import './RegisterForm.css';
import { validateNameInput, sanitizeInput } from '../utils/inputValidation';

interface RegisterFormProps {
  onRegister: (name: string) => Promise<void>;
  error: string | null;
}

function RegisterForm({ onRegister, error }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validate input on change
  useEffect(() => {
    if (name.trim() && hasAttemptedSubmit) {
      const validation = validateNameInput(name);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid name');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [name, hasAttemptedSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize input in real-time to prevent malicious content
    const sanitized = sanitizeInput(value);
    setName(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    const validation = validateNameInput(name);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid name');
      return;
    }
    
    if (!validation.sanitized) return;
    
    setValidationError(null);
    setIsSubmitting(true);
    try {
      console.log('RegisterForm: Calling onRegister with:', validation.sanitized);
      await onRegister(validation.sanitized);
      console.log('RegisterForm: onRegister completed');
    } catch (error) {
      console.error('RegisterForm: Error in handleSubmit:', error);
      // Error is handled by useAuth and passed via error prop
    } finally {
      console.log('RegisterForm: Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {/* Header Section */}
      <div className="register-header">
        <div className="emoji">🍁</div>
        <h1>Access Portal</h1>
        <p>Enter your credentials to access the Budget 2025 Navigator</p>
        <div className="access-badge">Secure Connection</div>
      </div>

      {/* Error Messages */}
      {error && <div className="register-error">{error}</div>}
      {validationError && <div className="register-error">{validationError}</div>}

      {/* Registration Form */}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="userName">Identification</label>
          <input
            id="userName"
            type="text"
            placeholder="Enter your name"
            autoComplete="off"
            value={name}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            aria-invalid={validationError ? 'true' : 'false'}
            aria-describedby={validationError ? 'name-error' : undefined}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting || !name.trim() || !!validationError}
          className={isSubmitting ? 'loading' : ''}
        >
          {isSubmitting ? 'Initializing' : 'Enter System'}
        </button>
      </form>

      {/* Security Notice */}
      <div className="security-notice">
        Encrypted Session • Budget 2025 Database
      </div>
    </div>
  );
}

export default RegisterForm;
