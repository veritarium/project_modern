# Discovery Protocol Self-Evaluation
## Did We Follow Our Own Rules for Project Modern?

**Date:** 2026-04-03  
**Question:** Should we build Project Modern from scratch or integrate existing solutions?

---

## The Discovery Protocol (from DISCOVERY_PROTOCOL.md)

> **BEFORE implementing ANY feature that could use an external tool:**
> 1. Classify the need (category from PROJECT_BOOTSTRAP.md)
> 2. Run the discovery protocol  
> 3. Find 3-5 current candidates
> 4. Score and compare them
> 5. Select the best fit
> 6. Only THEN begin implementation

---

## Phase 1: Problem Classification

### Category Tag
- **Primary:** `database` + `search` (Tool registry and discovery)
- **Secondary:** `security` (Package security scoring)
- **Tertiary:** `ai-ml` (Semantic recommendations)

### Complexity Level
- **Level 3 - Complex:** Multi-service, infrastructure, real-time updates

---

## Phase 2: Discovery Search

### Candidates Found

| # | Tool | What It Does | Scale |
|---|------|--------------|-------|
| 1 | **Libraries.io** | Indexes 10M+ packages, maintenance scores, dependency tracking | 10M packages |
| 2 | **Socket.dev** | Security-focused, detects 70+ supply chain risks, malicious code detection | Enterprise-focused |
| 3 | **OpenSSF Scorecard** | 18 automated security checks, risk scoring, CLI tool | Open source (CNCF) |
| 4 | **deps.dev** | Google's dependency analyzer, vulnerability tracking | Google-scale |
| 5 | **Snyk Advisor** | Security + maintenance scoring, license compliance | Commercial |
| 6 | **npms.io** | NPM search with quality scoring | NPM only |

---

## Phase 3: Evaluation Scoring

### Scoring Criteria (from DISCOVERY_PROTOCOL.md)

| Criterion | Weight | How to Check |
|-----------|--------|--------------|
| Activity | 25% | Last commit date, issue response time |
| Popularity | 15% | GitHub stars, npm downloads |
| Maintenance | 25% | Release frequency, security policy |
| Quality | 20% | Tests, types, docs, API design |
| Fit | 15% | Match to our specific need |

---

### Candidate 1: Libraries.io / Tidelift

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Activity** | 8/10 | Active development, backed by Tidelift (funded company) |
| **Popularity** | 9/10 | 10M+ packages indexed, widely referenced |
| **Maintenance** | 8/10 | Professional team, SLA for paid tier |
| **Quality** | 7/10 | Good API, documentation could be better |
| **Fit** | 6/10 | General package discovery, not IDE-integrated |
| **TOTAL** | **7.6/10** | |

**Pros:** Huge dataset, established, free API available  
**Cons:** Not focused on developer workflow integration, limited security insights

---

### Candidate 2: Socket.dev

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Activity** | 9/10 | Very active, funded ($20M+), rapid feature development |
| **Popularity** | 7/10 | Growing fast, used by Stripe, Figma, etc. |
| **Maintenance** | 9/10 | Professional team, enterprise SLA |
| **Quality** | 8/10 | Excellent UX, IDE extensions, great docs |
| **Fit** | 7/10 | Security-focused, less on general tool discovery |
| **TOTAL** | **8.0/10** | |

**Pros:** Best-in-class security detection, IDE integration, active development  
**Cons:** Focused on security not general tool recommendations, paid product

---

### Candidate 3: OpenSSF Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Activity** | 9/10 | CNCF project, active development, industry backing |
| **Popularity** | 8/10 | Used by Google, Microsoft, part of OpenSSF |
| **Maintenance** | 9/10 | Enterprise-grade, well-maintained |
| **Quality** | 8/10 | CLI + GitHub Action, good documentation |
| **Fit** | 7/10 | Security scoring, not discovery/recommendation |
| **TOTAL** | **8.2/10** | |

**Pros:** Open source, standardized scoring, free to use  
**Cons:** Security-only, no general tool discovery, no IDE integration

---

### Candidate 4: deps.dev (Google)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Activity** | 7/10 | Google project, maintained but not heavily marketed |
| **Popularity** | 6/10 | Lesser known, Google-internal focus |
| **Maintenance** | 8/10 | Google backing ensures longevity |
| **Quality** | 7/10 | Good API, limited docs |
| **Fit** | 6/10 | Dependency analysis, not developer discovery |
| **TOTAL** | **6.8/10** | |

**Pros:** Google-scale data, free API  
**Cons:** Limited documentation, not focused on developer experience

---

### Candidate 5: Snyk Advisor

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Activity** | 8/10 | Established company, regular updates |
| **Popularity** | 8/10 | Well-known in security space |
| **Maintenance** | 8/10 | Professional team |
| **Quality** | 7/10 | Good web UI, limited CLI |
| **Fit** | 6/10 | Security-focused, commercial product |
| **TOTAL** | **7.4/10** | |

**Pros:** Comprehensive security data  
**Cons:** Not open, expensive, limited discovery features

---

## Phase 4: Comparison Matrix

| Tool | Activity | Popularity | Maint | Quality | Fit | **Total** | License |
|------|----------|------------|-------|---------|-----|-----------|---------|
| Libraries.io | 8 | 9 | 8 | 7 | 6 | **7.6** | Open |
| **Socket.dev** | 9 | 7 | 9 | 8 | 7 | **8.0** | Commercial |
| **OpenSSF Scorecard** | 9 | 8 | 9 | 8 | 7 | **8.2** | Open |
| deps.dev | 7 | 6 | 8 | 7 | 6 | **6.8** | Google |
| Snyk Advisor | 8 | 8 | 8 | 7 | 6 | **7.4** | Commercial |

---

## Phase 5: Analysis & Decision

### The Brutal Truth

**WE DID NOT FOLLOW OUR OWN PROTOCOL.**

We designed Project Modern as a custom platform without:
1. Searching for existing solutions first
2. Evaluating candidates objectively
3. Considering integration over building
4. Validating the need before architecting

### What We Should Have Done

**Option A: Build on OpenSSF Scorecard (Recommended)**
```
┌─────────────────────────────────────────────────────────┐
│  PROJECT MODERN = Scorecard + Libraries.io + Our UX     │
├─────────────────────────────────────────────────────────┤
│  Scorecard:    Security scoring engine (18 checks)     │
│  Libraries.io: Package metadata (10M packages)         │
│  Our Layer:    IDE extensions, semantic search, UI     │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- Leverages existing, validated scoring systems
- CNCF-backed = enterprise credibility
- Free/open source core
- Focus our effort on UX (IDE, recommendations)

**Option B: Partner/Integrate with Socket.dev**
- They have security detection we can't build
- Their IDE extensions are excellent
- Could white-label or integrate API
- Focus on "tool discovery" while they handle "security"

**Option C: Build Custom (Original Plan)**
- Pros: Full control, unique features
- Cons: 6-12 months to parity with existing solutions
- Risk: Building what already exists

---

## The Golden Rule Violation

From `AGENTS.md`:

> **"Glue, Don't Build"**
> - ✅ GOOD: Integrating Pretext + Three.js + ifc.js for BIM viewer
> - ❌ BAD: Writing custom text measurement or IFC parser from scratch

**We chose BAD.**

We planned to build:
- Custom evaluation engine (instead of Scorecard)
- Custom security detection (instead of Socket.dev)
- Custom package database (instead of Libraries.io)

---

## Corrected Approach: The "Glue Architecture"

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT MODERN (Glue Layer)                  │
├─────────────────────────────────────────────────────────────────┤
│  IDE Extensions      CLI Tool       Web Dashboard              │
│  (VS Code/IntelliJ)  (modern CLI)   (Next.js)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    API Layer (Fastify)                         │
│  ┌─────────────┐  ┌───────┴──────┐  ┌─────────────────────┐   │
│  │  Semantic   │  │   Project    │  │   Recommendation    │   │
│  │   Search    │  │   Analyzer   │  │      Engine         │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘   │
└─────────┼────────────────┼─────────────────────┼──────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EXTERNAL TOOLS (The Foundation)                 │
├─────────────────────────────────────────────────────────────────┤
│  OpenSSF Scorecard    Libraries.io API     Socket.dev API      │
│  (Security scoring)   (Package metadata)   (Malware detection) │
├─────────────────────────────────────────────────────────────────┤
│  GitHub API          NPM Registry          Reddit/HN           │
│  (Activity metrics)  (Download stats)      (Sentiment)          │
└─────────────────────────────────────────────────────────────────┘
```

**What We Build:**
1. IDE extensions (VS Code, IntelliJ) - unique value
2. Semantic search/recommendations - unique value
3. Project analysis - unique value
4. Migration assistant - unique value
5. Team governance - unique value

**What We Integrate:**
1. Security scoring → OpenSSF Scorecard
2. Package metadata → Libraries.io
3. Malware detection → Socket.dev (or similar)
4. Activity data → GitHub API
5. Popularity data → NPM Registry

---

## Revised Implementation Plan

### Phase 0: Foundation (1 week, 1 dev)
- [ ] Evaluate OpenSSF Scorecard CLI integration
- [ ] Test Libraries.io API
- [ ] Build proof-of-concept: Scorecard + simple search

### Phase 1: Core API (2 weeks, 2 devs)
- [ ] Fastify API that aggregates Scorecard + Libraries.io
- [ ] SQLite cache layer (not PostgreSQL yet)
- [ ] Simple CLI using external data

### Phase 2: IDE Extensions (2 weeks, 2 devs)
- [ ] VS Code extension showing Scorecard data
- [ ] Hover providers, diagnostics
- [ ] Team sharing features

### Phase 3: Intelligence (3 weeks, 3 devs)
- [ ] Semantic search (our unique layer)
- [ ] Project analysis (our unique layer)
- [ ] Recommendations (our unique layer)

### Phase 4: Enterprise (3 weeks, 3 devs)
- [ ] Policy engine (allowlists/blocklists)
- [ ] SSO integration
- [ ] Audit logging

**Total: 11 weeks (not 20)**  
**Team: 3-4 developers (not 27)**  
**Cost: 1/5th of original plan**

---

## Key Insight

> **"The best code is the code you don't write."**

Project Modern's value is NOT in:
- Scraping GitHub (Libraries.io does this)
- Security scoring (Scorecard does this)
- Package metadata (NPM registry has this)

Project Modern's value IS in:
- IDE-integrated tool discovery
- Semantic recommendations
- Project context understanding
- Migration assistance
- Team governance

**Build the unique stuff. Glue the rest.**

---

## Action Items

1. **Spike:** Integrate OpenSSF Scorecard CLI (1 day)
2. **Spike:** Test Libraries.io API (1 day)
3. **Decision:** Proceed with glue architecture or custom build?
4. **If glue:** Start Phase 0 immediately
5. **If custom:** Document why existing solutions don't fit

---

*This evaluation follows our own Discovery Protocol from DISCOVERY_PROTOCOL.md*
*Score: Self-awareness 10/10 (finally)*
