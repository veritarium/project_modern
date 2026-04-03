# Project Modern - Semantic Search Service

AI-powered natural language search for discovering development tools.

## 🎯 What This Does

Traditional search: Type "react" → Get React  
**Semantic search: Type "frontend framework for building UIs" → Get React, Vue, Angular, Svelte ranked by relevance**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/semantic-search
npm install
```

### 2. Seed the Database

```bash
node seedTools.js
```

This indexes 50+ popular npm packages with embeddings.

### 3. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3001`

### 4. Test Semantic Search

```bash
# Search with natural language
curl "http://localhost:3001/search?q=react+table+component"

# Find similar tools
curl "http://localhost:3001/similar/npm/redux"

# Get stats
curl "http://localhost:3001/stats"
```

## 💡 Example Queries

| Query | What It Finds |
|-------|---------------|
| `http client for apis` | axios, node-fetch, got, superagent |
| `state management react` | redux, zustand, mobx |
| `css framework` | tailwindcss, bootstrap, material-ui |
| `testing framework` | jest, vitest, cypress |
| `animation library` | framer-motion, gsap |
| `date formatting` | dayjs, date-fns, moment |

## 📊 API Endpoints

### GET /search?q=query

Semantic search with natural language.

**Example:**
```bash
curl "http://localhost:3001/search?q=backend+framework&limit=5"
```

**Response:**
```json
{
  "query": "backend framework",
  "category": "http-client",
  "resultsCount": 5,
  "duration": "15ms",
  "results": [
    {
      "name": "express",
      "platform": "npm",
      "description": "Fast, unopinionated, minimalist web framework...",
      "score": 8.4,
      "similarity": 0.85,
      "combinedScore": 0.82
    },
    {
      "name": "fastify",
      "platform": "npm",
      "description": "Fast and low overhead web framework...",
      "score": 8.3,
      "similarity": 0.78,
      "combinedScore": 0.76
    }
  ]
}
```

### GET /similar/:platform/:name

Find similar tools to a given package.

**Example:**
```bash
curl "http://localhost:3001/similar/npm/lodash"
```

**Response:**
```json
{
  "tool": {
    "name": "lodash",
    "platform": "npm",
    "description": "A modern JavaScript utility library..."
  },
  "similar": [
    {
      "name": "ramda",
      "platform": "npm",
      "description": "Practical functional library...",
      "score": 7.8,
      "similarity": 0.92
    },
    {
      "name": "underscore",
      "platform": "npm",
      "description": "JavaScript's functional programming helper...",
      "score": 7.5,
      "similarity": 0.88
    }
  ]
}
```

### POST /index

Index a new tool.

**Request:**
```json
{
  "name": "my-awesome-lib",
  "platform": "npm",
  "description": "Does awesome things",
  "keywords": ["awesome", "utility"],
  "score": 8.0
}
```

### GET /stats

Get database statistics.

## 🧠 How It Works

### 1. Vector Embeddings

Text (name + description + keywords) → 128-dimension vector

```javascript
"A React table component" → [0.1, 0.3, 0.8, 0.2, ...]
```

### 2. Similarity Search

Cosine similarity between query and tool embeddings:

```javascript
similarity = cos(query_vector, tool_vector)
```

### 3. Hybrid Scoring

```
Combined Score = (Semantic Similarity × 0.7) + (Keyword Match × 0.3)
```

### 4. Query Categorization

Understands intent:
- "UI component" → ui-components category
- "HTTP client" → http-client category
- "Test framework" → testing category

## 📁 Architecture

```
semantic-search/
├── server.js           # Fastify API server
├── embeddings.js       # Vector embedding generation
├── database.js         # SQLite vector storage
├── seedTools.js        # Sample data loader
└── README.md
```

## 🔬 Embedding Algorithm

This spike uses a simplified embedding approach:

1. **Vocabulary matching** - Match words to 500+ predefined keywords
2. **Hash-based noise** - Add deterministic uniqueness
3. **Normalization** - Unit vector for cosine similarity

**Production upgrade:** Replace with OpenAI, Hugging Face, or local LLM embeddings.

## 💾 Data Storage

SQLite with JSON extension:

```sql
CREATE TABLE tools (
  id INTEGER PRIMARY KEY,
  name TEXT,
  platform TEXT,
  description TEXT,
  keywords TEXT,      -- JSON array
  embedding TEXT,     -- JSON vector [0.1, 0.2, ...]
  score REAL
);
```

**Production upgrade:** Use Pinecone, Weaviate, or pgvector.

## 🎯 Use Cases

### 1. Natural Language Discovery

```
User: "I need a chart library for React"
System: Recharts, D3, Chart.js ranked by React-fit
```

### 2. Alternative Suggestions

```
User: Looking at Redux
System: "Similar tools: Zustand, MobX, Jotai"
```

### 3. Context-Aware Recommendations

```
User has: React, Express, PostgreSQL
System suggests: Prisma (ORM), Jest (testing)
```

## 📈 Integration with Main API

The semantic search service complements the evaluation API:

```
User Query
    │
    ▼
┌─────────────────────┐
│ Semantic Search     │ ← "UI component library"
│ (This Service)      │
└──────────┬──────────┘
           │ Returns: ["material-ui", "chakra", "mantine"]
           ▼
┌─────────────────────┐
│ Evaluation API      │ ← Get scores for each
│ (Phase 0)           │
└──────────┬──────────┘
           │ Returns: Scored, ranked results
           ▼
┌─────────────────────┐
│ User sees:          │
│ 1. Material-UI 8.1  │
│ 2. Chakra UI 8.0    │
│ 3. Mantine 7.9      │
└─────────────────────┘
```

## 🚀 Next Steps

1. **Connect to main API** - Use semantic search in tool discovery
2. **Project context** - Analyze package.json to suggest additions
3. **Improve embeddings** - Use OpenAI or Hugging Face
4. **User feedback** - Learn from click-through rates

---

*Phase 3: Semantic Search - Bringing AI to tool discovery*
