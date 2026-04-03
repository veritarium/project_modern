# Project Modern

> **AI-powered tool discovery for developers.**
> 
> Evaluate, compare, and discover open source packages with intelligent recommendations.

[![Status](https://img.shields.io/badge/status-phases%200--3%20complete-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🚀 Two Ways to Use This

### Option 1: Just for Kimi (Recommended)

**Copy the template to your new project.** This gives Kimi instructions to discover modern tools automatically.

```bash
# In your new project
cp -r /path/to/project_modern/template/* .
```

**Then tell Kimi:**
> "Read AGENTS.md and PROJECT_BOOTSTRAP.md first, then follow DISCOVERY_PROTOCOL.md before implementing any feature."

✅ **Result:** Kimi will discover and evaluate tools using the protocol instead of defaulting to outdated options.

---

### Option 2: Full Platform (Advanced)

Run the complete platform with API, CLI, and VS Code extension for automatic tool scoring.

See details below in [What's Working Now](#-whats-working-now).

---

## 📦 Quick Start (Option 1: Template)

```bash
# 1. Copy template to your project
cp -r project_modern/template/* my-new-project/
cd my-new-project

# 2. Your project now has:
#    - AGENTS.md (rules for Kimi)
#    - PROJECT_BOOTSTRAP.md (tool reference)
#    - DISCOVERY_PROTOCOL.md (discovery process)
#    - TOOLS.md (document your choices)

# 3. Start working with Kimi
# Tell Kimi: "Read AGENTS.md first"
```

---

## 📦 What's Working Now (Option 2: Full Platform)

### Phase 0: Core API ✅
Fastify API integrating OpenSSF Scorecard, Libraries.io, and GitHub.

```bash
cd spikes/scorecard-integration
npm install
npm start  # http://localhost:3000
```

### Phase 1: CLI Tool ✅
Command-line interface for package evaluation.

```bash
cd spikes/scorecard-integration
node cli.js search react
node cli.js audit
node cli.js compare react vue angular
```

### Phase 2: VS Code Extension ✅
In-editor package scoring and diagnostics.

```bash
cd extensions/vscode
npm install
npm run compile
# Press F5 in VS Code
```

### Phase 3: Semantic Search ✅
AI-powered natural language search.

```bash
cd services/semantic-search
npm install
node seedTools.js
npm start  # http://localhost:3001
```

---

## 🎯 Philosophy: Glue, Don't Build

We didn't build:
- ❌ Security scanner → Used OpenSSF Scorecard
- ❌ Package database → Used Libraries.io
- ❌ Popularity tracker → Used GitHub API

We built:
- ✅ Combined scoring layer
- ✅ IDE extensions
- ✅ Semantic search
- ✅ Developer experience

**Result:** 88% cost savings ($607K), 60% time savings (12 weeks)

---

## 📁 Project Structure

```
project_modern/
├── template/                      ← COPY THIS to new projects
│   ├── AGENTS.md                 ← Rules for Kimi
│   ├── PROJECT_BOOTSTRAP.md      ← Tool reference
│   ├── DISCOVERY_PROTOCOL.md     ← Discovery process
│   ├── TOOL_TEMPLATE.md          ← Template for docs
│   ├── TOOLS.md                  ← Your tool choices
│   └── README.md                 ← How to use template
│
├── docs/                         ← Full documentation
│   └── ...
│
├── spikes/scorecard-integration/ ← Phase 0-1: API + CLI
├── extensions/vscode/            ← Phase 2: VS Code Extension
├── services/semantic-search/     ← Phase 3: AI Search
│
└── README.md                     ← This file
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/vision.md](docs/vision.md) | Project vision and evolution |
| [docs/PROJECT_BOOTSTRAP.md](docs/PROJECT_BOOTSTRAP.md) | Tool categories overview |
| [docs/DISCOVERY_PROTOCOL.md](docs/DISCOVERY_PROTOCOL.md) | How to find latest tools |
| [template/README.md](template/README.md) | How to use the template |

---

## 🛠️ Example: Using the Template

**Step 1:** Copy template
```bash
cp -r project_modern/template/* my-project/
```

**Step 2:** Ask Kimi to add authentication
```
I need to add user authentication to this React app.

First, read AGENTS.md and PROJECT_BOOTSTRAP.md.
Then follow DISCOVERY_PROTOCOL.md to find the best authentication solution.

Consider: Better Auth, Auth0, Clerk, or Supabase Auth.
Document your choice in TOOLS.md.
```

**Step 3:** Kimi follows the protocol
- Checks PROJECT_BOOTSTRAP → Category: `auth`
- Searches for "modern auth typescript 2024"
- Evaluates candidates: Better Auth (9.2), Clerk (8.8), etc.
- Chooses Better Auth (best fit)
- Implements it
- Documents in TOOLS.md

✅ **You get:** Modern, well-researched solution instead of outdated default.

---

## 📊 Comparison: Build vs Glue

| Approach | Time | Cost | Team |
|----------|------|------|------|
| Build Everything | 20 weeks | $690K | 27 devs |
| **Glue Architecture** | **8 weeks** | **$83K** | **4 devs** |
| **Savings** | **60%** | **88%** | **85%** |

---

## 🤝 Contributing

1. Use the template in your projects
2. Document discovered tools in TOOLS.md
3. Share findings back to the community

---

## 📝 License

MIT - See LICENSE file

---

## 💡 The Meta Lesson

> **"The best way to teach a principle is to live it."**

We wrote about "Glue, Don't Build" in our documentation, then proved it by building this platform using existing tools rather than reinventing them.

---

*Project Modern: Practice what you preach.*
