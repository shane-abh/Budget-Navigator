export interface Message {
  content: string;
  isUser: boolean;
  optimization?: QueryOptimization;
  sources?: Source[];
  totalDocs?: number;
}

export interface QueryOptimization {
  original: string;
  rewritten?: string;
  expanded?: string[];
}

export interface Source {
  source_file: string;
  page: number;
  preview: string;
}

// Auth types
export interface AuthState {
  userName: string | null;
  sessionId: string | null;
  authToken: string | null;
  questionsRemaining: number | null;
  isAuthenticated: boolean;
}

export interface RegisterResponse {
  name: string;
  session_id: string;
  token: string;
  questions_remaining: number;
}

export interface AuthMeResponse {
  name: string;
  session_id: string;
  questions_remaining: number;
}






