# Project Modern - Phase 0 & 1: Core API + CLI

## 🎯 Goal
Prove that Project Modern can be built by **gluing existing tools** instead of building everything from scratch.

## ✅ What This Proves

This spike demonstrates a working API and CLI that integrate:

| External Tool | Provides | We Build |
|--------------|----------|----------|
| **OpenSSF Scorecard** | Security scoring (18 checks) | Integration layer |
| **Libraries.io** | Package metadata, maintenance | Integration layer |
| **GitHub API** | Stars, forks, activity | Integration layer |
| **Our Combined Algorithm** | - | Weighted scoring formula |
| **CLI Tool** | - | Developer interface |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd spikes/scorecard-integration
npm install
```

### 2. (Optional) Install OpenSSF Scorecard

For real security data:

```bash
# macOS
brew install scorecard

# Linux
curl -sSfL https://raw.githubusercontent.com/ossf/scorecard/main/install.sh | sh

# Verify
scorecard version
```

> If not installed, the API will use realistic mock data.

### 3. (Optional) Set API Keys

For higher rate limits:

```bash
export GITHUB_TOKEN="your_github_token"
export LIBRARIES_IO_API_KEY="your_libraries_io_key"
```

### 4. Start the API Server

Terminal 1:
```bash
npm start
```

The API will start on `http://localhost:3000`

### 5. Use the CLI

Terminal 2:

```bash
# Search for a package
node cli.js search react

# Audit current project
node cli.js audit

# Compare packages
node cli.js compare react vue angular

# Generate report
node cli.js audit --report

# Show help
node cli.js help
```

Or install globally:
```bash
npm link
modern search react
modern audit
```

### 6. Open the Demo UI

Open `demo.html` in your browser for a visual interface.

---

## 💻 CLI Commands

### `modern search <package>`

Search and evaluate a specific package.

```bash
modern search react
modern search lodash --platform npm
modern search django --platform pypi
```

**Output:**
```
🔍 Evaluating npm/react...

============================================================
📦 react (npm)
============================================================

🏆 Project Modern Score: ✅ 8.4/10 (A)

📊 Score Breakdown:
   Security:      ✅ 8.5/10 (OpenSSF Scorecard)
   Maintenance:   ✅ 8.2/10 (Libraries.io)
   Popularity:    ✅ 10.0/10 (GitHub)
   Ecosystem:     ✅ 7.1/10 (Dependents)

🔒 Security Checks (OpenSSF Scorecard):
   ✅ Code-Review: 10/10
   ✅ Maintained: 8/10
   ✅ Security-Policy: 10/10
   ⚠️ Branch-Protection: 3/10
   ❌ Signed-Releases: 0/10

💡 Recommendation:
   ✅ Excellent choice - High quality, well-maintained
```

### `modern audit`

Audit all dependencies in the current project's package.json.

```bash
modern audit
modern audit --path ./my-project/package.json
modern audit --report  # Generate TOOLS.md
```

**Output:**
```
📦 Auditing ./package.json...

Found 25 dependencies. Evaluating...

============================================================
AUDIT SUMMARY
============================================================

📊 Overall Score: ✅ 7.8/10
📦 Dependencies Evaluated: 25/25

🎓 Grade Distribution:
   A: 12 packages
   B: 8 packages
   C: 3 packages
   D: 2 packages

⚠️ Packages needing attention:
   ❌ old-package@1.0.0: ❌ 4.2/10
   ❌ deprecated-lib@2.1.0: ❌ 3.8/10

🏆 Top Packages:
   1. react: ✅ 8.4/10
   2. typescript: ✅ 8.9/10
   3. lodash: ✅ 7.8/10
```

### `modern compare <pkg1> <pkg2> [...]`

Compare multiple packages side-by-side.

```bash
modern compare react vue angular
modern compare npm/react npm/vue
```

**Output:**
```
🔍 Comparing 3 packages...

============================================================
COMPARISON RESULTS
============================================================

Rank  Package                    Score   Grade   Status
----------------------------------------------------------------------
🥇 1   npm/react                  ✅ 8.4/10 A      ✅ Recommended
🥈 2   npm/vue                    ✅ 8.1/10 A      ✅ Recommended
🥉 3   npm/angular                ✅ 7.6/10 B      ⚠️ Consider alternatives

Detailed Breakdown:

npm/react:
  Security:      ✅ 8.5/10
  Maintenance:   ✅ 8.2/10
  Popularity:    ✅ 10.0/10
  Ecosystem:     ✅ 7.1/10

npm/vue:
  Security:      ✅ 8.3/10
  Maintenance:   ✅ 8.5/10
  Popularity:    ✅ 9.2/10
  Ecosystem:     ✅ 6.8/10
```

### `modern report`

Generate a TOOLS.md report for the project.

```bash
modern report
modern report --output DEPENDENCIES.md
```

Creates a markdown file with:
- Overall project score
- Grade distribution
- All dependencies with scores
- Packages needing attention
- Top recommendations

### `modern help`

Show help information.

```bash
modern help
```

---

## 📊 API Endpoints

### GET /health
Health check and configuration status.

```json
{
  "status": "ok",
  "timestamp": "2026-04-03T15:30:00.000Z",
  "scorecardEnabled": true,
  "githubTokenSet": true,
  "librariesIoKeySet": false
}
```

### GET /tools/:platform/:name
Evaluate a specific package.

**Example:** `GET /tools/npm/react`

```json
{
  "name": "react",
  "platform": "npm",
  "evaluation": {
    "composite": 8.4,
    "breakdown": {
      "security": 8.5,
      "maintenance": 8.2,
      "popularity": 10.0,
      "ecosystem": 7.1
    },
    "grade": "A",
    "recommendation": "Excellent choice - High quality, well-maintained"
  },
  "sources": {
    "scorecard": {
      "score": 8.5,
      "checks": [...],
      "isMock": false
    },
    "libraries": {
      "stars": 223000,
      "forks": 45000,
      "dependents": 15000000,
      "isMock": false
    },
    "github": {
      "stars": 223000,
      "forks": 45000,
      "isMock": false
    }
  },
  "metadata": {
    "description": "A declarative, efficient, and flexible JavaScript library...",
    "license": "MIT",
    "homepage": "https://reactjs.org",
    "repository": "https://github.com/facebook/react",
    "keywords": ["javascript", "framework", "frontend"]
  }
}
```

### POST /compare
Compare multiple packages.

**Request:**
```json
{
  "tools": [
    {"platform": "npm", "name": "react"},
    {"platform": "npm", "name": "vue"},
    {"platform": "npm", "name": "svelte"}
  ]
}
```

**Response:**
```json
{
  "results": [...],
  "ranked": [
    {"rank": 1, "name": "npm/react", "score": 8.4},
    {"rank": 2, "name": "npm/vue", "score": 8.1},
    {"rank": 3, "name": "npm/svelte", "score": 7.9}
  ]
}
```

### GET /tools/popular
List popular packages to evaluate.

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests verify:
- CLI commands work correctly
- Error handling works
- API integration functions

---

## 🧮 Our Unique Layer: Combined Scoring

The API combines data from multiple sources using our proprietary scoring formula:

```
Composite Score = 
  (Security × 0.30) +      # From OpenSSF Scorecard
  (Maintenance × 0.25) +   # From Libraries.io
  (Popularity × 0.25) +    # From GitHub API
  (Ecosystem × 0.20)       # From Libraries.io dependents
```

This is our **unique value add** - the external tools provide raw data, we provide intelligent aggregation.

---

## 💰 Cost Comparison

### Original Plan (Build Everything)

| Component | Cost |
|-----------|------|
| Build custom security scanner | 6 devs × 4 weeks = $48K |
| Build custom package database | 6 devs × 6 weeks = $72K |
| Build custom popularity metrics | 3 devs × 2 weeks = $12K |
| **Total** | **$132K + maintenance** |

### Glue Architecture (This Spike)

| Component | Cost |
|-----------|------|
| OpenSSF Scorecard (open source) | $0 |
| Libraries.io API (free tier) | $0 |
| GitHub API (free tier) | $0 |
| Integration development | 1 dev × 1 week = $2K |
| **Total** | **$2K** |

**Savings: $130K (98%)**

---

## ⏱️ Time Comparison

| Approach | Time to Working Product |
|----------|------------------------|
| Build Everything | 12 weeks |
| Glue Architecture (This Spike) | 1 day |

**Time saved: 11.5 weeks**

---

## 📁 Architecture

```
cli.js (CLI Tool)
├── searchCommand()       # modern search <pkg>
├── auditCommand()        # modern audit
├── compareCommand()      # modern compare <pkg1> <pkg2>
├── reportCommand()       # modern report
└── Calls API

api.js (Fastify API)
├── /health
├── /tools/:platform/:name
│   ├── getScorecardData()      # Integrates OpenSSF Scorecard
│   ├── getLibrariesIoData()    # Integrates Libraries.io
│   ├── getGitHubData()         # Integrates GitHub API
│   └── calculateProjectModernScore()  # OUR ALGORITHM
├── /compare
└── /tools/popular

demo.html (Frontend)
└── Visual interface to API
```

---

## 🚀 Next Steps

After this spike is validated:

1. **Phase 2: IDE Extensions**
   - VS Code extension using this API
   - Show scores in package.json hover
   - Diagnostics for low scores

2. **Phase 3: Semantic Search**
   - Add vector embeddings
   - Natural language queries
   - "React table library" → ranked results

3. **Phase 4: Enterprise**
   - Policy engine
   - Team sharing
   - SSO integration

---

## ✅ Validation Checklist

- [x] API integrates OpenSSF Scorecard
- [x] API integrates Libraries.io
- [x] API integrates GitHub API
- [x] Combined scoring algorithm works
- [x] CLI tool provides developer interface
- [x] Demo UI provides visual interface
- [x] Mock data works without API keys
- [x] Real data works with API keys
- [x] Caching layer implemented
- [x] Tests verify functionality
- [ ] Redis caching (production)
- [ ] Rate limiting (production)
- [ ] Authentication (production)

---

## 📝 Key Insight

> **"The best tool is the one you don't have to build."**

By integrating:
- Scorecard for security
- Libraries.io for maintenance
- GitHub for popularity

We can focus on what makes Project Modern unique:
- **IDE-integrated recommendations**
- **Semantic search**
- **Project context analysis**
- **Migration assistance**

This is the "Glue, Don't Build" philosophy in action.

---

*Phase 0 & 1 Complete: Working API + CLI*
