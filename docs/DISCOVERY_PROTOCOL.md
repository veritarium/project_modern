# Dynamic Tool Discovery Protocol

> How Kimi should find the latest state-of-the-art tools when starting any project.
> This protocol ensures you always work with current best solutions, not outdated knowledge.

---

## The Core Principle

**Never assume you know the best tool.** Always verify with live sources.

Kimi's knowledge has a cutoff. The best tool for any problem likely changed after that date.

---

## Phase 1: Problem Classification

Before searching, classify your need:

### Category Tags
Use these to focus your search:

| Tag | Description | Example Needs |
|-----|-------------|---------------|
| `ui-layout` | Text measurement, rendering | Code editor, data grid, terminal |
| `ui-components` | Pre-built UI elements | Forms, modals, tables |
| `3d-rendering` | WebGL, 3D graphics | Model viewer, game, visualization |
| `bim-cad` | IFC, CAD, engineering | Construction, manufacturing |
| `real-time` | WebSockets, sync | Collaboration, live updates |
| `database` | Storage, queries | App data, analytics, search |
| `auth` | Authentication, SSO | User login, permissions |
| `ai-ml` | Machine learning | LLMs, inference, agents |
| `build-tools` | Bundling, compilation | Dev workflow, library publishing |
| `testing` | Quality assurance | Unit, integration, e2e tests |
| `deployment` | Hosting, CI/CD | Serverless, containers, edge |

### Complexity Level
```
Level 1 - Simple: Drop-in library, minimal config
Level 2 - Moderate: Framework integration, some setup
Level 3 - Complex: Infrastructure, multi-service
```

---

## Phase 2: Discovery Search

### Search Query Patterns

Use these exact patterns with web search:

#### GitHub Discovery
```
site:github.com "{keyword}" {category} 2024 2025
site:github.com trending "{keyword}" typescript
site:github.com topics:{category} stars:>1000 pushed:>2024-01-01
```

#### Reddit/HN Discovery (Community Buzz)
```
site:reddit.com/r/javascript best "{keyword}" 2024
site:news.ycombinator.com "{keyword}" show hn
site:news.ycombinator.com "{keyword}" alternatives
```

#### Documentation Discovery
```
"{keyword}" getting started 2024
best "{keyword}" library {framework} 2025
"{keyword}" vs "{competitor}" comparison
```

#### Package Registry Discovery
```
site:npmjs.com "{keyword}" popularity
site:jsr.io "{keyword}" {category}
site:crates.io "{keyword}" {category}
site:pypi.org "{keyword}" {category}
```

### Search Priority by Category

| Category | Primary Sources | Secondary Sources |
|----------|-----------------|-------------------|
| JS/TS Libraries | GitHub, npm, JSR, HN | Reddit, Twitter/X |
| Rust Tools | crates.io, GitHub, This Week in Rust | HN |
| Python Tools | PyPI, GitHub, HN | Reddit r/Python |
| Go Tools | pkg.go.dev, GitHub | Reddit r/golang |
| AI/ML | Hugging Face, GitHub, arXiv | Papers With Code |
| DevOps | GitHub, HN, Reddit | Official blogs |

---

## Phase 3: Evaluation Criteria

For each tool found, score it on these criteria:

### 1. Activity Score (0-10)
```
10 = Last commit within 1 week, active issues/PRs
 8 = Last commit within 1 month
 6 = Last commit within 3 months
 4 = Last commit within 6 months
 2 = Last commit within 1 year
 0 = Stale (>1 year) or archived
```

### 2. Popularity Score (0-10)
```
10 = 10k+ GitHub stars, widely discussed
 8 = 5k+ stars, growing adoption
 6 = 1k+ stars, niche but solid
 4 = 500+ stars, emerging
 2 = 100+ stars, new/experimental
 0 = Unknown or personal project
```

### 3. Maintenance Score (0-10)
Check for:
- ✅ Regular releases (not just commits)
- ✅ Responsive maintainers (issue resolution)
- ✅ Clear roadmap or changelog
- ✅ Security policy
- ❌ Open critical issues without response
- ❌ Deprecated dependencies
- ❌ Author seeking maintainer

### 4. Quality Score (0-10)
Check for:
- ✅ Test coverage badge or visible tests
- ✅ TypeScript definitions (for JS tools)
- ✅ Documentation completeness
- ✅ Examples and tutorials
- ✅ Clear API design
- ❌ Breaking changes without migration guide
- ❌ Missing docs for common use cases

### 5. Fit Score (0-10)
How well does it match YOUR specific need?
```
10 = Perfect match, purpose-built
 8 = Good match, minor compromises
 6 = Adequate, some workarounds needed
 4 = Stretch, significant adaptation required
 2 = Poor fit, major hacks needed
 0 = Wrong category entirely
```

### Composite Score
```
TOTAL = Activity × 0.25 + Popularity × 0.15 + Maintenance × 0.25 + Quality × 0.20 + Fit × 0.15

Minimum viable: 6.0
Recommended: 7.5+
Exceptional: 9.0+
```

---

## Phase 4: Comparison & Selection

### Create Shortlist
1. Find 3-5 candidates using search patterns
2. Score each on all criteria
3. Rank by composite score

### Comparison Matrix Template
```markdown
| Tool | Activity | Popularity | Maint | Quality | Fit | Total |
|------|----------|------------|-------|---------|-----|-------|
| A    | 9        | 8          | 9     | 8       | 9   | 8.6   |
| B    | 7        | 9          | 7     | 9       | 7   | 7.8   |
| C    | 10       | 5          | 8     | 7       | 8   | 7.7   |
```

### Final Selection Rules
```
1. If one tool scores 9.0+: Use it unless Fit is low
2. If scores are close (±0.5): Choose better Fit score
3. If all scores <6.0: Consider building custom OR broaden search
4. Always check "alternatives to X" for the top candidate
```

---

## Phase 5: Verification

### Before Committing

1. **Check for Hype vs Reality**
   - Search "{tool} problems"
   - Search "{tool} alternatives reddit"
   - Look for "we migrated from X to Y" posts

2. **Verify Production Readiness**
   - Check for 1.0+ release (or stable for 6+ months)
   - Look for companies using it (often in README or ADOPTERS.md)
   - Check bundle size (for client-side tools)
   - Verify browser/Node version compatibility

3. **Test Integration**
   - Try minimal proof-of-concept
   - Check for framework conflicts (React, Vue, etc.)
   - Verify TypeScript support quality
   - Test error messages and debugging experience

4. **Check Ecosystem**
   - Are there plugins/extensions?
   - Is there community (Discord, forum)?
   - Are there learning resources (videos, articles)?

---

## Red Flags - Avoid These

### Tool Warning Signs
- ⚠️ Single maintainer with no backup
- ⚠️ "Looking for maintainers" notice
- ⚠️ Frequent breaking changes without semver
- ⚠️ No response to security issues
- ⚠️ Vague "we're rebuilding from scratch" announcements
- ⚠️ Dependency on abandoned projects
- ⚠️ Licensing changes (BSL → SSPL → ?)

### Hype Warning Signs
- ⚠️ "Revolutionary" claims without benchmarks
- ⚠️ No production users after 1+ year
- ⚠️ Only tutorials from creator, no community content
- ⚠️ "Wait for v2, v1 was just a prototype"
- ⚠️ VC-funded with unclear monetization path

---

## Quick Reference: Best Sources by Tool Type

### JavaScript/TypeScript Ecosystem
| Source | Best For | URL Pattern |
|--------|----------|-------------|
| GitHub Trending | Rising stars | github.com/trending |
| JSR | Modern TypeScript | jsr.io |
| npms.io | Search & rankings | npms.io |
| Bundlephobia | Size analysis | bundlephobia.com |
| State of JS | Community trends | stateofjs.com |

### AI/ML Tools
| Source | Best For | URL Pattern |
|--------|----------|-------------|
| Hugging Face | Models & datasets | huggingface.co |
| Papers With Code | Research implementations | paperswithcode.com |
| LLM Leaderboard | Model comparisons | huggingface.co/spaces |
| Ollama Library | Local LLMs | ollama.com/library |

### General Open Source
| Source | Best For | URL Pattern |
|--------|----------|-------------|
| GitHub Explore | Discovery | github.com/explore |
| Awesome Lists | Curated collections | github.com/topics/awesome |
| Hacker News | Tech trends | news.ycombinator.com |
| Product Hunt | New launches | producthunt.com |

---

## Example: Complete Discovery Flow

### Scenario: Need a high-performance virtual list

**Step 1: Classify**
- Category: `ui-layout`
- Complexity: Level 2 (framework integration)

**Step 2: Search**
```
site:github.com "virtual list" react 2024
site:github.com "virtual scroll" typescript
site:reddit.com/r/reactjs best virtual list 2024
```

**Step 3: Candidates Found**
- react-window
- react-virtualized
- @tanstack/react-virtual
- react-virtuoso

**Step 4: Score**
```
react-window: Activity 6 (maintenance mode), Pop 10, Maint 8, Quality 8, Fit 8 = 7.8
react-virtualized: Activity 4 (deprecated), Pop 10, Maint 4, Quality 7, Fit 8 = 6.1
@tanstack/react-virtual: Activity 10, Pop 7, Maint 10, Quality 9, Fit 9 = 9.0
react-virtuoso: Activity 8, Pop 6, Maint 9, Quality 9, Fit 7 = 7.9
```

**Step 5: Verify**
- @tanstack/react-virtual is actively maintained by TanStack
- Modern headless approach (framework agnostic)
- Good docs and examples
- Used in production (check TanStack Table)

**Decision**: Use @tanstack/react-virtual

---

## Integration with Project Workflow

### At Project Start
1. Read PROJECT_BOOTSTRAP.md for category overview
2. For each major feature, run this discovery protocol
3. Document findings in your project's TOOLS.md

### When Adding Features
1. Run discovery even for "simple" needs
2. The "obvious" choice might be outdated
3. Update TOOLS.md with new discoveries

### Quarterly Review
1. Re-run discovery for critical dependencies
2. Check if better alternatives emerged
3. Plan migrations if significant improvements found

---

## Summary Checklist

```
□ Classify the need (category + complexity)
□ Search GitHub, Reddit, HN with targeted queries
□ Find 3-5 candidates
□ Score each: Activity, Popularity, Maintenance, Quality, Fit
□ Compare and select top candidate
□ Verify: search for problems, check production usage
□ Test minimal integration
□ Document choice with rationale
```

---

> **Remember**: The best tool today may not be the best tool tomorrow.
> This protocol ensures you always find current state-of-the-art solutions.
