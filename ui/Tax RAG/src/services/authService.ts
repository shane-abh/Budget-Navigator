import { API_BASE_URL } from '../config';
import type { AuthMeResponse, RegisterResponse } from '../types';

// Helper function to add timeout to fetch
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeoutMs: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    throw error;
  }
};

// Helper function to add timeout to promise (for response body reading)
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

export const authService = {
  async checkAuth(): Promise<AuthMeResponse | null> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/me`,
        {
          method: 'GET',
          credentials: 'include'
        },
        10000 // 10 second timeout for auth check
      );
      return response.ok ? response.json() : null;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  },

  async register(name: string): Promise<RegisterResponse> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name })
        },
        30000 // 30 second timeout for registration
      );

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.detail || 'Registration failed');
        } catch (jsonError) {
          throw new Error(`Registration failed with status ${response.status}`);
        }
      }

      // Parse JSON with timeout protection (response body reading can hang)
      let data: RegisterResponse;
      try {
        // Use response.json() with timeout - reading response body can hang even after 200 OK
        data = await withTimeout(
          response.json(),
          5000, // 5 second timeout for JSON parsing
          'Response parsing timeout. Server may be slow.'
        );
        console.log('Registration response received:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        if (parseError instanceof Error && parseError.message.includes('timeout')) {
          throw parseError;
        }
        throw new Error('Invalid response from server. Please try again.');
      }

      // Validate required fields (allow extra fields like 'message')
      if (!data || typeof data !== 'object') {
        console.error('Invalid response - not an object:', data);
        throw new Error('Invalid response format from server. Please try again.');
      }

      if (!data.name || !data.session_id || !data.token || typeof data.questions_remaining !== 'number') {
        console.error('Invalid response format - missing required fields:', {
          hasName: !!data.name,
          hasSessionId: !!data.session_id,
          hasToken: !!data.token,
          hasQuestionsRemaining: typeof data.questions_remaining === 'number',
          fullResponse: data
        });
        throw new Error('Invalid response format from server. Please try again.');
      }

      // Return only the fields we need (ignore extra fields like 'message')
      return {
        name: data.name,
        session_id: data.session_id,
        token: data.token,
        questions_remaining: data.questions_remaining
      } as RegisterResponse;
    } catch (error) {
      // Handle network errors, timeouts, etc.
      if (error instanceof Error) {
        // Re-throw with user-friendly message
        if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          throw new Error('Connection timeout. The server may be slow or unreachable. Please try again.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithTimeout(
        `${API_BASE_URL}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        },
        10000 // 10 second timeout for logout
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

