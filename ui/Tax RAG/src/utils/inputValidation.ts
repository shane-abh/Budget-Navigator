/**
 * Input validation and sanitization utilities to prevent XSS and malicious content
 */

/**
 * Patterns that indicate potentially malicious content
 */
const MALICIOUS_PATTERNS = [
  // Script tags and event handlers
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,
  /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  // Data URIs that could contain scripts
  /data:text\/html/gi,
  // VBScript
  /vbscript:/gi,
  // SQL injection patterns (basic)
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
];

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: { [key: string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  return text.replace(/[<>&"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Checks if input contains potentially malicious content
 */
export function containsMaliciousContent(input: string): boolean {
  const normalized = input.toLowerCase();
  return MALICIOUS_PATTERNS.some(pattern => pattern.test(normalized));
}

/**
 * Sanitizes input by removing dangerous patterns and escaping HTML
 */
export function sanitizeInput(input: string): string {
  let sanitized = input;
  
  // Remove script tags and dangerous HTML
  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[\s\S]*?>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove event handlers (onclick=, onerror=, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Escape remaining HTML
  sanitized = escapeHtml(sanitized);
  
  return sanitized.trim();
}

/**
 * Validates input and returns validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates user input for chat messages
 */
export function validateChatInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Message is too long (maximum 5000 characters)' };
  }
  
  if (containsMaliciousContent(trimmed)) {
    return { 
      isValid: false, 
      error: 'Message contains potentially unsafe content. Please remove any scripts or HTML tags.',
      sanitized: sanitizeInput(trimmed)
    };
  }
  
  return { isValid: true, sanitized: trimmed };
}

/**
 * Validates user name input for registration
 */
export function validateNameInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Name is too long (maximum 100 characters)' };
  }
  
  // Allow only alphanumeric, spaces, hyphens, apostrophes, and common unicode characters
  // This prevents script injection while allowing legitimate names
  const namePattern = /^[\p{L}\p{N}\s\-'.,]+$/u;
  if (!namePattern.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Name contains invalid characters. Please use only letters, numbers, spaces, and common punctuation.',
      sanitized: sanitizeInput(trimmed)
    };
  }
  
  if (containsMaliciousContent(trimmed)) {
    return { 
      isValid: false, 
      error: 'Name contains potentially unsafe content. Please use a valid name.',
      sanitized: sanitizeInput(trimmed)
    };
  }
  
  return { isValid: true, sanitized: trimmed };
}

/**
 * Sanitizes text for safe display (removes scripts but preserves formatting)
 */
export function sanitizeForDisplay(text: string): string {
  return sanitizeInput(text);
}


