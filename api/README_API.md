# RAG Chat API - FastAPI Implementation

This is a FastAPI conversion of your RAG (Retrieval Augmented Generation) system. It maintains all your original functionality while providing REST API endpoints and streaming chat capabilities.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements_api.txt
```

### 2. Setup Environment Variables

Make sure your `.env` file contains:
```
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

> 💡 **Tip**: Generate a secure JWT secret with: `python -c "import secrets; print(secrets.token_hex(32))"`

### 3. Run the FastAPI Server

```bash
# Development mode (with auto-reload)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 4. Test the API

Open your browser to:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Chat Interface**: Open `test_client.html` in your browser

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:8000/
```
Returns API status and version.

### Register User (Authentication)
```bash
POST http://localhost:8000/auth/register
Content-Type: application/json

{
  "name": "John Doe"
}
```
**Response:**
```json
{
  "message": "Registration successful",
  "name": "John Doe",
  "session_id": "uuid-string",
  "questions_remaining": 10
}
```
> 🔐 This endpoint sets an **HttpOnly cookie** containing a JWT token. The cookie is automatically sent with subsequent requests.

### Get Current User
```bash
GET http://localhost:8000/auth/me
```
Requires authentication (HttpOnly cookie).

**Response:**
```json
{
  "name": "John Doe",
  "session_id": "uuid-string",
  "questions_remaining": 8,
  "authenticated": true
}
```

### Logout
```bash
POST http://localhost:8000/auth/logout
```
Clears the authentication cookie.

### Chat with Streaming (SSE)
```bash
POST http://localhost:8000/chat/stream
Content-Type: application/json

{
  "message": "What is Canada's response to U.S. tariffs?",
  "use_query_expansion": true
}
```
> 🔐 Requires authentication. Include `credentials: 'include'` (fetch) or `withCredentials: true` (EventSource).

> ⚠️ **Rate Limit**: Each session is limited to **10 questions**. Once the limit is reached, you'll receive a `429 Too Many Requests` error and must register again to start a new session.

**Stream Events:**
- `session`: Session information (includes `questions_remaining` count)
- `original_query`: Your original question
- `rewritten_query`: Optimized version of your query
- `expanded_terms`: Related terms for better search
- `query_variations`: Different ways to search
- `sources`: Relevant document sources
- `status`: Processing status updates
- `answer_start`: Answer generation begins
- `answer_chunk`: Streamed answer text
- `answer_complete`: Answer finished
- `done`: Process complete

### Upload Document
```bash
POST http://localhost:8000/upload
Content-Type: multipart/form-data

file: your_document.pdf
```

**Response:**
```json
{
  "message": "Document uploaded and indexed successfully",
  "document_name": "your_document.pdf",
  "num_pages": 50,
  "num_chunks": 85,
  "processing_time": 45.2
}
```

### List Documents
```bash
GET http://localhost:8000/documents
```

**Response:**
```json
{
  "index_name": "rag-documents",
  "documents": ["document1.pdf", "document2.pdf"],
  "total": 2
}
```

### Get Session History
```bash
GET http://localhost:8000/session/{session_id}/history
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "messages": [
    {
      "role": "user",
      "content": "What is...",
      "timestamp": 1234567890.123,
      "metadata": {}
    }
  ],
  "total_messages": 5
}
```

### Delete Session
```bash
DELETE http://localhost:8000/session/{session_id}
```

## 🎨 Chat Interface

Open `test_client.html` in your browser for a beautiful chat interface with:
- ✅ Real-time streaming responses
- ✅ Query optimization display (shows rewritten query and expanded terms)
- ✅ Source document references
- ✅ Session management
- ✅ Modern, responsive UI

## 📝 Example Usage with cURL

### Chat Query
```bash
curl -X POST "http://localhost:8000/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main points about tariffs?",
    "use_query_expansion": true
  }'
```

### Upload Document
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@document.pdf"
```

## 🔧 Features Preserved from Original Script

- ✅ **Semantic Chunking**: Uses your original merge_semantic_chunks function
- ✅ **Query Optimization**: Rewriting, expansion, and variations
- ✅ **Pinecone Integration**: Same vector database setup
- ✅ **Google Gemini LLM**: Same model and prompts
- ✅ **Document Tracking**: Uses your indexed_documents.json system
- ✅ **Ensemble Retrieval**: Vector + BM25 (when available)

## 🌟 New Features

- ✅ **REST API**: Easy integration with any frontend
- ✅ **Server-Sent Events**: Real-time streaming responses
- ✅ **Session Management**: Multi-user conversation tracking
- ✅ **JWT Authentication**: Secure HttpOnly cookie-based auth
- ✅ **Session Rate Limiting**: Maximum 10 questions per session (configurable)
- ✅ **Query Optimization Display**: Users see how their queries are improved
- ✅ **Interactive Docs**: Auto-generated API documentation
- ✅ **CORS Support**: Frontend integration ready

## 🧪 Testing the API

### Using Python
```python
import requests

# Create a session to store cookies
session = requests.Session()

# Register user
response = session.post(
    "http://localhost:8000/auth/register",
    json={"name": "John Doe"}
)
print(response.json())
# Cookie is automatically stored in the session

# Ask question (streaming)
import json

response = session.post(
    "http://localhost:8000/chat/stream",
    json={
        "message": "What is the document about?",
        "use_query_expansion": True
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        decoded_line = line.decode('utf-8')
        if decoded_line.startswith('data: '):
            data = json.loads(decoded_line[6:])
            print(data)
```

### Using JavaScript (Browser)
```javascript
// Step 1: Register (browser stores HttpOnly cookie automatically)
await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Important: receive the cookie
    body: JSON.stringify({ name: 'John Doe' })
});

// Step 2: Use EventSource with credentials
const eventSource = new EventSource(
    `http://localhost:8000/chat/stream?message=Your question here&use_query_expansion=true`,
    { withCredentials: true }  // Important: send the cookie
);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data.type, data);
};
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│ (test_client.html)│
└────────┬────────┘
         │ HTTP/SSE
         ▼
┌─────────────────┐
│   FastAPI       │
│   (app.py)      │
├─────────────────┤
│ • Query Rewrite │
│ • Query Expand  │
│ • Retrieval     │
│ • LLM Generate  │
└────────┬────────┘
         │
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Pinecone│ │Google  │ │Session │
│Vector  │ │Gemini  │ │Store   │
│  DB    │ │  LLM   │ │(Memory)│
└────────┘ └────────┘ └────────┘
```

## 🔒 Security & Rate Limiting

### JWT Authentication with HttpOnly Cookies (Implemented)

The API uses secure JWT-based authentication:

1. **User Registration**: User provides their name at `/auth/register`
2. **JWT Token**: Server creates a JWT token with user info and session ID
3. **HttpOnly Cookie**: Token is stored in a secure HttpOnly cookie (JavaScript cannot access it)
4. **Automatic Auth**: Browser sends cookie automatically on all requests

```
┌─────────────┐         POST /auth/register         ┌─────────────┐
│   Browser   │  ─────────────────────────────────► │   Backend   │
│             │         { "name": "John" }          │             │
│             │                                     │             │
│             │  ◄───────────────────────────────── │             │
│             │   Set-Cookie: auth_token=eyJ...     │             │
│             │   (HttpOnly, Secure, SameSite)      │             │
└─────────────┘                                     └─────────────┘
```

**Why HttpOnly Cookies?**
- 🛡️ **XSS Protection**: JavaScript cannot access the token
- 🔄 **Automatic**: Browser handles sending the cookie
- ✅ **Works with EventSource**: Unlike headers, cookies work with SSE

### Session-Based Rate Limiting (Implemented)

Each session is limited to a maximum number of questions to prevent abuse:

- **Default Limit**: 10 questions per session
- **Configuration**: Adjust `MAX_QUESTIONS_PER_SESSION` in `app.py`
- **Response**: When limit is reached, returns HTTP `429 Too Many Requests`
- **Session Info**: Each response includes `questions_remaining` count

```json
// Example session event in stream response
{"type": "session", "session_id": "uuid-string", "questions_remaining": 7}
```

### Authentication Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `JWT_SECRET` | (from .env) | Secret key for signing tokens |
| `JWT_ALGORITHM` | HS256 | Algorithm for JWT encoding |
| `JWT_EXPIRY_HOURS` | 24 | Token expiration time |

### Production Considerations

Before deploying to production:

1. ✅ **Authentication**: JWT with HttpOnly cookies (implemented)
2. **IP-Based Rate Limiting**: Add per-IP limits using `slowapi`
3. **Persistent Sessions**: Use Redis instead of in-memory storage
4. **Error Handling**: Add comprehensive error logging
5. **Monitoring**: Add metrics and health checks
6. **CORS**: Configure allowed origins properly
7. **HTTPS**: Use SSL certificates (required for `secure` cookie flag)
8. **JWT_SECRET**: Set a strong secret in production `.env`

## 📦 What's Changed from Original

### Original Script (`main.py`)
- Runs once, processes documents, asks one question
- Prints everything to console
- No API interface

### New FastAPI Version (`app.py`)
- Always running, ready to serve requests
- Multiple concurrent users/sessions
- RESTful API endpoints
- Streaming responses
- Chat history tracking
- Same core logic and functions

## 🐛 Troubleshooting

**Issue**: `uvicorn: command not found`
```bash
pip install uvicorn[standard]
```

**Issue**: CORS errors in browser
- Make sure the server is running on `http://localhost:8000`
- Check browser console for specific errors

**Issue**: "RAG system not initialized"
- Make sure Pinecone index exists with documents
- Upload at least one document using the `/upload` endpoint

**Issue**: Slow streaming
- This is normal for the word-by-word streaming effect
- Adjust the delay in `app.py` (search for `asyncio.sleep`)

**Issue**: "Session limit reached" (HTTP 429)
- Each session is limited to 10 questions
- Start a new session using `POST /session/new`
- Or adjust `MAX_QUESTIONS_PER_SESSION` in `app.py` if you need more

## 📄 License

Same as your original project.

## 🤝 Contributing

This maintains 100% compatibility with your original script while adding API functionality.

