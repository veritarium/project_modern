# Project Modern: Walking Skeleton Plan
## Build-Measure-Learn Approach for 100 Developers

> **Core Principle:** Build the thinnest vertical slice that delivers value, validate with real users, then iterate.

---

## Phase 0: Foundation (Week 1) - 1 Developer
*Goal: Convert existing docs into a queryable knowledge base*

### Step 1: Parse Existing Documentation
- [ ] **1.1** Create parser for existing markdown files
- [ ] **1.2** Extract tool names, descriptions, categories from docs
- [ ] **1.3** Build structured JSON database from docs (100+ tools)
- [ ] **1.4** Add simple search index (fuse.js or lunr.js)
- [ ] **1.5** Create CLI that queries this local database

**Deliverable:** `modern search "virtual list"` works offline using existing docs
**Team:** 1 developer
**Duration:** 2-3 days

### Step 2: Package.json Analyzer (MVP)
- [ ] **2.1** Parse local package.json
- [ ] **2.2** Match dependencies against tool database
- [ ] **2.3** Display tool scores/evaluations from docs
- [ ] **2.4** Highlight tools not in database
- [ ] **2.5** Export TOOLS.md template

**Deliverable:** `modern audit` shows which dependencies have evaluations
**Team:** 1 developer  
**Duration:** 2-3 days

### Validation Gate 0
**Question:** Can we extract value from existing docs alone?
**Test:** Have 5 developers try `modern search` and `modern audit`
**Success Criteria:** 3/5 say they would use this weekly

---

## Phase 1: Live Data (Weeks 2-3) - 2 Developers
*Goal: Add live GitHub data to existing evaluations*

### Step 3: GitHub Integration
- [ ] **3.1** Create GitHub API client with rate limiting
- [ ] **3.2** Fetch stars, last commit, open issues for tools
- [ ] **3.3** Calculate activity score from live data
- [ ] **3.4** Cache results locally (SQLite)
- [ ] **3.5** Update CLI to show live + cached data

**Deliverable:** Tool evaluations show "last commit: 2 days ago" from real data
**Team:** 2 developers
**Duration:** 1 week

### Step 4: Scraper MVP
- [ ] **4.1** Nightly GitHub scrape for top 100 tools
- [ ] **4.2** Detect new tools from Hacker News "Show HN"
- [ ] **4.3** Simple queue (SQLite + cron, not BullMQ)
- [ ] **4.4** Manual review queue for new tools
- [ ] **4.5** Update JSON database with fresh data

**Deliverable:** Database auto-updates daily with fresh GitHub data
**Team:** 2 developers
**Duration:** 1 week

### Validation Gate 1
**Question:** Does live data make evaluations more trustworthy?
**Test:** Compare old vs new evaluations with 10 developers
**Success Criteria:** 7/10 prefer live data version

---

## Phase 2: Web Dashboard (Weeks 4-6) - 3 Developers
*Goal: Make the tool database browsable by the whole team*

### Step 5: Simple Web UI
- [ ] **5.1** Single Next.js app (no microservices yet)
- [ ] **5.2** Read-only tool browser
- [ ] **5.3** Search with filters (category, framework, score)
- [ ] **5.4** Tool detail pages
- [ ] **5.5** Compare 2-3 tools side-by-side
- [ ] **5.6** Deploy to Vercel

**Deliverable:** URL the whole team can bookmark to browse tools
**Team:** 3 developers (1 backend, 2 frontend)
**Duration:** 2 weeks

### Step 6: Team Features
- [ ] **6.1** Simple auth (GitHub OAuth only)
- [ ] **6.2** Team creation (just a name + members)
- [ ] **6.3** Shared bookmarks
- [ ] **6.4** Team tool recommendations
- [ ] **6.5** Simple analytics (most viewed tools)

**Deliverable:** Teams can share tool discoveries
**Team:** 3 developers
**Duration:** 1 week

### Validation Gate 2
**Question:** Will teams use a web dashboard for tool discovery?
**Test:** 3 teams use it for 1 week
**Success Criteria:** 50+ searches per team, 10+ bookmarks created

---

## Phase 3: IDE Integration (Weeks 7-8) - 2 Developers
*Goal: Bring recommendations into the developer workflow*

### Step 7: VS Code Extension (MVP)
- [ ] **7.1** Extension scaffold
- [ ] **7.2** Show tool scores in package.json hover
- [ ] **7.3** Command palette: "Search Project Modern"
- [ ] **7.4** Sidebar: Tool explorer (read-only)
- [ ] **7.5** Diagnostics: Flag unmaintained deps

**Deliverable:** Developers see scores without leaving VS Code
**Team:** 2 developers
**Duration:** 2 weeks

### Validation Gate 3
**Question:** Is IDE integration 10x better than web dashboard?
**Test:** Measure usage: IDE vs web for same team
**Success Criteria:** 70% of interactions happen in IDE

---

## Phase 4: Intelligence (Weeks 9-12) - 3 Developers
*Goal: Add AI features only after core works*

### Step 8: Semantic Search
- [ ] **8.1** Generate embeddings for tool descriptions
- [ ] **8.2** Add vector search endpoint
- [ ] **8.3** Natural language to tool recommendation
- [ ] **8.4** "Similar tools" feature
- [ ] **8.5** A/B test vs keyword search

**Deliverable:** "Show me React table libraries" returns ranked results
**Team:** 3 developers (1 ML, 2 backend)
**Duration:** 2 weeks

### Step 9: Project Analysis
- [ ] **9.1** Upload package.json
- [ ] **9.2** Detect frameworks automatically
- [ ] **9.3** Suggest missing tools ("You might need a state manager")
- [ ] **9.4** Identify outdated dependencies
- [ ] **9.5** Generate project TOOLS.md

**Deliverable:** Upload package.json, get recommendations
**Team:** 3 developers
**Duration:** 2 weeks

### Validation Gate 4
**Question:** Do AI features actually improve tool discovery?
**Test:** A/B test recommendations vs manual search
**Success Criteria:** 30% higher tool adoption rate with AI

---

## Phase 5: Enterprise (Weeks 13-16) - 4 Developers
*Goal: Add governance for large organizations*

### Step 10: Policy Engine
- [ ] **10.1** Allowlist/blocklist management
- [ ] **10.2** Score threshold enforcement
- [ ] **10.3** License compliance checks
- [ ] **10.4** Policy violation alerts
- [ ] **10.5** Approval workflows for new tools

**Deliverable:** CTO can enforce "no tools below score 7"
**Team:** 4 developers
**Duration:** 2 weeks

### Step 11: SSO & Security
- [ ] **11.1** SAML/OIDC integration
- [ ] **11.2** Role-based access
- [ ] **11.3** Audit logging
- [ ] **11.4** SOC 2 compliance features
- [ ] **11.5** Self-hosted option

**Deliverable:** Enterprise security requirements met
**Team:** 4 developers
**Duration:** 2 weeks

### Validation Gate 5
**Question:** Will enterprises pay for governance features?
**Test:** Pilot with 2 enterprise customers
**Success Criteria:** 1 paid contract signed

---

## Phase 6: Scale (Weeks 17-20) - 5 Developers
*Goal: Handle 100+ teams, public API, community*

### Step 12: Infrastructure Hardening
- [ ] **12.1** Move from SQLite to PostgreSQL
- [ ] **12.2** Add Redis for caching
- [ ] **12.3** Kubernetes deployment
- [ ] **12.4** Monitoring/alerting
- [ ] **12.5** Multi-region setup

**Deliverable:** Handles 10,000+ developers
**Team:** 5 developers (1 DevOps, 4 backend)
**Duration:** 2 weeks

### Step 13: Public API & Community
- [ ] **13.1** Public REST API
- [ ] **13.2** Tool verification for authors
- [ ] **13.3** Community contributions
- [ ] **13.4** Badge system
- [ ] **13.5** Plugin architecture

**Deliverable:** External developers can integrate
**Team:** 5 developers
**Duration:** 2 weeks

---

## Comparison: Old vs New Plan

| Aspect | Old Plan | New Plan |
|--------|----------|----------|
| **Time to first value** | 5 weeks (Step 25) | 3-4 days (Step 1.5) |
| **Technologies in Phase 1** | 10+ (K8s, Redis, Meilisearch, etc.) | 2 (Node.js, SQLite) |
| **Validation checkpoints** | 0 | 6 gates |
| **Team size start** | 27 developers | 1 developer |
| **Risk of building wrong thing** | High | Low |
| **Complexity at Week 4** | Microservices architecture | CLI + JSON database |

---

## Key Decisions

### Why SQLite to start?
- Single file, no setup
- Good enough for 100 developers
- Migrate to PostgreSQL only when needed

### Why no microservices initially?
- Adds deployment complexity
- Network latency hurts IDE responsiveness
- Monolith is fine until >1000 developers

### Why GitHub OAuth only at first?
- Everyone has GitHub
- SAML adds weeks of complexity
- Add enterprise auth only when enterprise customers ask

### Why start with CLI not web?
- Developers live in terminal
- No deployment needed (npm install)
- Faster iteration cycle

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Existing docs are insufficient | Validate in Phase 0, pivot if needed |
| Developers won't use CLI | Gate 0 catches this before major investment |
| GitHub API limits | Start with caching, upgrade plan if needed |
| Team outgrows SQLite | Migration path defined in Phase 6 |
| Enterprise won't pay | Gate 5 validates before building |

---

## Success Metrics by Phase

- **Phase 0:** 5 developers say "I'd use this"
- **Phase 1:** Database updates automatically, scores feel accurate
- **Phase 2:** 3 teams actively using dashboard
- **Phase 3:** 70% usage in IDE vs web
- **Phase 4:** 30% improvement in tool adoption
- **Phase 5:** 1 paid enterprise contract
- **Phase 6:** 10,000+ developers using platform

---

## Immediate Next Steps

1. **Assign 1 developer** to Phase 0 (Steps 1-2)
2. **Timebox to 1 week** - if not working, reassess
3. **Get 5 developers to try it** before any further investment
4. **Only proceed to Phase 1** if Gate 0 passes

---

*This plan prioritizes learning over building, validation over features, and simplicity over scalability (initially).*
