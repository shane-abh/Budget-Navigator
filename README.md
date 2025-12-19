# 🍁 Budget Navigator

<div align="center">

**An AI-Powered Conversational Interface to Canada's Budget 2025**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-green.svg)](https://python.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com)

[Live Demo](https://budgetnavigator.shaneabh.com) · [API Docs](https://api.budgetnavigator.shaneabh.com/docs)

</div>

---

## 📋 Table of Contents

- [Business Value](#-business-value)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Algorithms Deep Dive](#-algorithms-deep-dive)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Security](#-security)
- [License](#-license)

---

## 💼 Business Value

### The Problem
Government budget documents are **dense, lengthy, and difficult to navigate**. Canada's Budget 2025 contains hundreds of pages covering investments in housing, defense, infrastructure, tax changes, and economic projections. For citizens, journalists, researchers, and policymakers:

- 📚 **Information Overload**: Finding specific information means reading through hundreds of pages
- ⏱️ **Time Consuming**: Searching for answers about specific programs or policies is tedious
- 🔍 **Context Missing**: Traditional search returns snippets without comprehensive understanding
- 🚫 **Accessibility Barrier**: Technical financial language creates barriers for everyday citizens

### The Solution
Budget Navigator is a **Retrieval-Augmented Generation (RAG) chatbot** that transforms how people interact with government fiscal documents:

| Benefit | Description |
|---------|-------------|
| **Instant Answers** | Ask natural language questions, get immediate comprehensive responses |
| **Smart Retrieval** | AI finds the most relevant sections across the entire document |
| **Context-Aware** | Maintains conversation history for follow-up questions |
| **Democratized Access** | Makes complex policy information accessible to everyone |
| **Source Transparency** | Every answer includes references to original document pages |

### Use Cases
- 🏠 **Citizens**: "What housing programs are available for first-time buyers?"
- 📰 **Journalists**: "What is the government's response to U.S. tariffs?"
- 🏛️ **Policymakers**: "What are the economic projections for 2025-2027?"
- 📊 **Researchers**: "How much is allocated to defense spending?"
- 💼 **Business Owners**: "What tax changes affect small businesses?"

---

## 🔬 How It Works

Budget Navigator uses a sophisticated **RAG (Retrieval-Augmented Generation)** pipeline that combines the power of vector search with large language models.

### The RAG Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER ASKS A QUESTION                                │
│                  "What are the housing initiatives in Budget 2025?"          │
└─────────────────────────────────┬────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: QUERY OPTIMIZATION                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ 1.1 Query Rewriting                                                     │ │
│  │     "What specific housing programs and investments are outlined        │ │
│  │      in Canada's Budget 2025 for residential development?"              │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │ 1.2 Query Expansion                                                     │ │
│  │     → affordable housing, residential programs, home ownership,         │ │
│  │       rental assistance, housing subsidies, construction funding...     │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │ 1.3 Query Variations                                                    │ │
│  │     → 5 different phrasings for comprehensive retrieval                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: DOCUMENT RETRIEVAL                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Pinecone      │    │   Embedding     │    │    Cosine       │          │
│  │   Vector DB     │◄───│   Search        │◄───│   Similarity    │          │
│  │   (768 dims)    │    │   (Top-K=10)    │    │   Matching      │          │
│  └────────┬────────┘    └─────────────────┘    └─────────────────┘          │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Retrieved: 15-20 unique document chunks from multiple query variations  │ │
│  │ Deduplicated using content hashing to avoid redundant information       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: ANSWER GENERATION                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        Google Gemini 2.5 Flash                          │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │ │
│  │  │ System Prompt + Conversation History + Retrieved Context +        │  │ │
│  │  │ User Question → Comprehensive, Sourced Answer                     │  │ │
│  │  └───────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: STREAMING RESPONSE                                                   │
│  • Real-time word-by-word streaming via Server-Sent Events (SSE)             │
│  • Source documents displayed with page numbers                               │
│  • Query optimization steps shown for transparency                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Document Processing Pipeline

Before the system can answer questions, documents must be processed and indexed:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PDF       │────►│   Load &    │────►│   Pre-      │────►│  Semantic   │
│   Upload    │     │   Parse     │     │   Split     │     │  Chunking   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                    ┌─────────────┐     ┌─────────────┐            │
                    │  Pinecone   │◄────│   Embed     │◄───────────┘
                    │   Index     │     │   Chunks    │
                    └─────────────┘     └─────────────┘
```

**Processing Steps:**
1. **PDF Loading**: PyPDFLoader extracts text and metadata from uploaded PDFs
2. **Pre-Splitting**: RecursiveCharacterTextSplitter creates initial 1000-char chunks with 100-char overlap
3. **Semantic Chunking**: Chunks are merged based on semantic similarity (threshold: 0.7)
4. **Embedding**: Google's embedding model converts text to 768-dimensional vectors
5. **Indexing**: Vectors are stored in Pinecone for fast similarity search

---

## ✨ Key Features

### 🎯 Intelligent Query Processing
| Feature | Description |
|---------|-------------|
| **Query Rewriting** | LLM reformulates vague questions into precise, retrieval-optimized queries |
| **Query Expansion** | Generates 5-8 synonyms and related terms to capture all relevant documents |
| **Multi-Query Retrieval** | Runs up to 5 query variations for comprehensive document coverage |

### 💬 Real-Time Chat Experience
- **Streaming Responses**: See answers generated word-by-word for immediate engagement
- **Conversation Memory**: Follow-up questions maintain context from previous messages
- **Query Transparency**: View how your question was optimized for better results
- **Source Citations**: Every answer includes page numbers and document references

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure token-based auth with HttpOnly cookies (XSS protection)
- **Session Management**: Isolated conversation sessions per user
- **Rate Limiting**: 10 questions per session to prevent abuse
- **CORS Protection**: Strict origin policies for production deployment

### 📄 Document Management
- **PDF Upload**: Add new budget documents or supplementary materials
- **Automatic Indexing**: Documents are semantically chunked and indexed automatically
- **Multi-Document Support**: Query across multiple documents simultaneously

### 🎨 Modern UI/UX
- **Responsive Design**: Beautiful interface that works on desktop and mobile
- **Markdown Support**: Rich text formatting in responses
- **Loading States**: Clear visual feedback during processing
- **Error Handling**: Graceful error messages and recovery

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | Core programming language | 3.11+ |
| **FastAPI** | High-performance async web framework | 0.109.0 |
| **LangChain** | LLM orchestration and RAG pipeline | 1.0+ |
| **Pinecone** | Managed vector database | 3.0+ |
| **Google Gemini** | Large Language Model (gemini-2.5-flash-lite) | Latest |
| **PyJWT** | JWT token authentication | 2.8+ |
| **Uvicorn/Gunicorn** | ASGI server with multi-worker support | Latest |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI component library | 19.2.0 |
| **TypeScript** | Type-safe JavaScript | 5.9.3 |
| **Vite** | Build tool and dev server | 7.2.4 |
| **React Markdown** | Markdown rendering | 10.1.0 |
| **CSS3** | Custom styling (no frameworks) | - |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Static file serving for frontend |
| **Traefik** | Reverse proxy with automatic SSL |

### AI/ML Services
| Service | Purpose |
|---------|---------|
| **Google Generative AI Embeddings** | Text-to-vector conversion (768 dimensions) |
| **Pinecone Serverless** | Vector storage and similarity search |
| **Google Gemini 2.5 Flash Lite** | Response generation |

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRAEFIK REVERSE PROXY                                │
│              (SSL Termination, Load Balancing, Routing)                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ budgetnavigator.shaneabh.com → UI Service (Port 80)                     ││
│  │ api.budgetnavigator.shaneabh.com → API Service (Port 8000)              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────┬─────────────────────────────────────┬────────────────────────┘
               │                                     │
               ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────────┐
│      UI SERVICE              │    │          API SERVICE                      │
│  ┌────────────────────────┐  │    │  ┌────────────────────────────────────┐  │
│  │   Nginx Container      │  │    │  │    FastAPI + Gunicorn              │  │
│  │   (Static React App)   │  │    │  │    (4 Uvicorn Workers)             │  │
│  │                        │  │    │  │                                    │  │
│  │   - index.html         │  │    │  │  ┌──────────────────────────────┐  │  │
│  │   - JS/CSS bundles     │  │    │  │  │  Authentication Layer        │  │  │
│  │   - API proxy config   │  │    │  │  │  (JWT + HttpOnly Cookies)    │  │  │
│  └────────────────────────┘  │    │  │  └──────────────────────────────┘  │  │
└──────────────────────────────┘    │  │  ┌──────────────────────────────┐  │  │
                                    │  │  │  RAG Engine                   │  │  │
                                    │  │  │  - Query Optimization         │  │  │
                                    │  │  │  - Document Retrieval         │  │  │
                                    │  │  │  - Response Generation        │  │  │
                                    │  │  └──────────────────────────────┘  │  │
                                    │  │  ┌──────────────────────────────┐  │  │
                                    │  │  │  Session Manager              │  │  │
                                    │  │  │  (In-Memory Store)            │  │  │
                                    │  │  └──────────────────────────────┘  │  │
                                    │  └────────────────────────────────────┘  │
                                    └──────────────┬───────────────────────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────┐
                    │                              │                          │
                    ▼                              ▼                          ▼
         ┌──────────────────┐          ┌──────────────────┐       ┌──────────────────┐
         │   PINECONE       │          │   GOOGLE AI      │       │   GOOGLE AI      │
         │   Vector DB      │          │   Embeddings     │       │   Gemini LLM     │
         │   (Serverless)   │          │   (768-dim)      │       │   (2.5 Flash)    │
         └──────────────────┘          └──────────────────┘       └──────────────────┘
```

### Data Flow for a Chat Request

```
┌─────────┐    ┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌─────────┐
│ Browser │───►│ Traefik │───►│ FastAPI     │───►│ Pinecone │    │ Gemini  │
│         │    │         │    │             │    │          │    │         │
│         │◄───│         │◄───│             │◄───│          │    │         │
│         │    │         │    │             │───────────────────►│         │
│         │◄───│         │◄───│             │◄───────────────────│         │
└─────────┘    └─────────┘    └─────────────┘    └──────────┘    └─────────┘
   SSE              │              │
   Stream           │              │
                    │              ├── Query Optimization
                    │              ├── Vector Search (k=10)
                    │              ├── Context Assembly
                    │              └── Response Streaming
```

---

## 🧮 Algorithms Deep Dive

### 1. Semantic Chunking Algorithm

Traditional chunking splits documents at fixed character counts, often breaking in the middle of ideas. Budget Navigator uses **semantic chunking** that respects document structure:

```python
# Algorithm: Semantic Similarity Merging
def merge_semantic_chunks(pre_chunks, similarity_threshold=0.7):
    """
    Merges adjacent chunks if they're semantically similar.
    
    1. Generate embeddings for all pre-chunks
    2. For each adjacent pair, calculate cosine similarity
    3. If similarity >= threshold AND combined size < 2800 chars:
       → Merge into single chunk
    4. Otherwise:
       → Keep as separate chunks
    """
```

**Why 0.7 threshold?**
- Too low (< 0.5): Unrelated content gets merged
- Too high (> 0.85): Almost nothing merges
- 0.7: Balances semantic coherence with meaningful aggregation

**Why 2800 char limit?**
- Keeps chunks within embedding model context limits
- Ensures each chunk is digestible for LLM processing
- Maintains retrieval precision

### 2. Cosine Similarity for Vector Search

Pinecone uses **cosine similarity** to find relevant documents:

```
                    A · B
cos(θ) = ─────────────────────
          ||A|| × ||B||

Where:
- A = Query embedding vector (768 dimensions)
- B = Document chunk embedding vector
- Range: -1 to 1 (1 = identical, 0 = orthogonal, -1 = opposite)
```

**Why Cosine over Euclidean?**
| Metric | Pros | Cons |
|--------|------|------|
| **Cosine** | Direction-focused, scale-invariant | Ignores magnitude |
| **Euclidean** | Considers magnitude | Sensitive to vector length |

For semantic search, **direction matters more than magnitude** – two texts about "housing" should match even if one is longer.

### 3. Query Optimization Pipeline

#### Step 1: Query Rewriting
Uses the LLM to reformulate the query for better retrieval:

```
Input:  "what about houses?"
Output: "What specific housing programs, investments, and policies 
         are outlined for residential development and home ownership?"
```

#### Step 2: Query Expansion
Generates synonyms and related terms:

```
Input:  "housing initiatives"
Output: ["affordable housing", "residential programs", "home ownership",
         "rental assistance", "housing subsidies", "construction funding",
         "mortgage support", "housing policy"]
```

#### Step 3: Multi-Query Retrieval
Runs multiple query variations and deduplicates results:

```python
for variation in query_variations[:5]:
    docs = retriever.invoke(variation)
    for doc in docs:
        content_hash = hash(doc.page_content)
        if content_hash not in seen:
            seen.add(content_hash)
            all_docs.append(doc)
```

### 4. Embedding Model Details

| Property | Value |
|----------|-------|
| Model | `models/embedding-001` (Google) |
| Dimensions | 768 |
| Context Window | 2048 tokens |
| Similarity Metric | Cosine |

### 5. Retrieval Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `k` (top results) | 10 | Balance between context richness and noise |
| `similarity_threshold` | 0.7 | Ensures relevant content merging |
| `max_chunk_size` | 2800 chars | Fits LLM context without truncation |
| `chunk_overlap` | 100 chars | Preserves context at boundaries |
| `query_variations` | 5 | Comprehensive coverage without API overuse |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **Docker & Docker Compose** (for containerized deployment)
- **Pinecone Account** (free tier available)
- **Google AI API Key**

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/budget-navigator.git
cd budget-navigator
```

#### 2. Backend Setup

```bash
# Navigate to API directory
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements_api.txt

# Create .env file
cat > .env << EOF
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=$(python -c "import secrets; print(secrets.token_hex(32))")
EOF

# Start the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup

```bash
# Navigate to UI directory
cd ui/Tax\ RAG

# Install dependencies
npm install

# Create environment config
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

#### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Initial Document Upload

Before asking questions, upload the budget document:

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@path/to/budget-2025.pdf"
```

---

## 🐳 Deployment

### Docker Compose Deployment

```bash
# Create .env file at project root
cat > .env << EOF
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=$(python -c "import secrets; print(secrets.token_hex(32))")
EOF

# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Production Deployment with Traefik

The included `docker-compose.yml` is configured for production deployment with Traefik:

1. **Configure DNS**: Point your domain to your server
2. **Setup Traefik**: Create an external `web_proxy` network
3. **Update domains**: Modify the Traefik labels in `docker-compose.yml`
4. **Deploy**: `docker-compose up -d`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PINECONE_API_KEY` | Yes | Pinecone API key |
| `GOOGLE_API_KEY` | Yes | Google AI API key |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 32 chars) |
| `VITE_API_URL` | Build-time | API URL for frontend |

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register with name, get session |
| `POST` | `/auth/logout` | Clear auth cookie |
| `GET` | `/auth/me` | Get current user info |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/chat/stream` | Stream chat response (SSE) |
| `GET` | `/session/{id}/history` | Get conversation history |

### Document Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload and index PDF |
| `GET` | `/documents` | List indexed documents |

### Example: Streaming Chat

```javascript
// Register user
const registerResponse = await fetch('https://api.example.com/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'John Doe' })
});

// Stream chat response
const eventSource = new EventSource(
  `https://api.example.com/chat/stream?message=${encodeURIComponent(question)}`,
  { withCredentials: true }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'answer_chunk') {
    console.log(data.content);  // Streamed answer text
  }
};
```

---

## 🔒 Security

### Authentication Flow

```
┌─────────────┐        POST /auth/register        ┌─────────────┐
│   Browser   │ ────────────────────────────────► │   Backend   │
│             │        { "name": "John" }         │             │
│             │                                   │             │
│             │ ◄──────────────────────────────── │             │
│             │   Set-Cookie: auth_token=eyJ...   │             │
│             │   (HttpOnly, Secure, SameSite)    │             │
└─────────────┘                                   └─────────────┘
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **XSS Protection** | HttpOnly cookies (JS cannot access tokens) |
| **CSRF Protection** | SameSite cookie attribute |
| **Token Expiry** | JWT expires after 24 hours |
| **Rate Limiting** | 10 questions per session |
| **Input Validation** | Server-side sanitization of all inputs |
| **CORS** | Strict origin whitelist |

### Production Checklist

- [ ] Set strong `JWT_SECRET` in environment
- [ ] Enable `secure=True` for cookies (requires HTTPS)
- [ ] Configure specific CORS origins (no wildcards)
- [ ] Use SSL/TLS certificates (Let's Encrypt via Traefik)
- [ ] Enable Gunicorn with multiple workers
- [ ] Set up monitoring and logging

---

## 📊 Performance

### Benchmarks (Typical Query)

| Stage | Time |
|-------|------|
| Query Optimization | ~1.5s |
| Vector Search | ~200ms |
| Document Retrieval | ~500ms |
| Response Generation | ~2-4s |
| **Total (streaming start)** | **~2s** |

### Scalability

- **Backend**: Gunicorn with 4 Uvicorn workers handles concurrent requests
- **Vector DB**: Pinecone Serverless scales automatically
- **Frontend**: Static files served via Nginx (CDN-ready)

---

## 📁 Project Structure

```
budget-navigator/
├── api/                          # Backend API
│   ├── app.py                    # FastAPI application (main)
│   ├── main.py                   # CLI version (standalone)
│   ├── requirements_api.txt      # Python dependencies
│   ├── indexed_documents.json    # Document tracking
│   └── data/                     # Uploaded documents
│
├── ui/Tax RAG/                   # Frontend Application
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── components/           # UI components
│   │   │   ├── ChatArea.tsx      # Message display
│   │   │   ├── InputArea.tsx     # User input
│   │   │   ├── Header.tsx        # App header
│   │   │   └── ...
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useAuth.ts        # Authentication logic
│   │   ├── services/             # API communication
│   │   ├── utils/                # Helper functions
│   │   └── types.ts              # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml            # Production orchestration
├── Dockerfile.api                # API container
├── Dockerfile.ui                 # UI container
├── LICENSE                       # GPL v3
└── README.md                     # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google AI** for Gemini LLM and embedding models
- **Pinecone** for vector database infrastructure
- **LangChain** for RAG orchestration framework
- **FastAPI** for the excellent Python web framework
- **React Team** for the UI library

---

<div align="center">

**Built with ❤️ for making government information accessible**

[Report Bug](https://github.com/yourusername/budget-navigator/issues) · [Request Feature](https://github.com/yourusername/budget-navigator/issues)

</div>

