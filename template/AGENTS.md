# AGENTS.md - Tool Discovery & Usage Rules

> Rules for Kimi when working on projects. These ensure you use state-of-the-art tools
> and follow a dynamic discovery protocol to find the latest solutions.

---

## CRITICAL: Start of Every Project

### Step 1: Read Bootstrap
```
ALWAYS read PROJECT_BOOTSTRAP.md first when starting ANY new project.
This contains categories of modern tools you likely don't know about.
```

### Step 2: Read Discovery Protocol
```
ALWAYS read DISCOVERY_PROTOCOL.md to understand HOW to find the latest tools.
This ensures you don't rely on outdated knowledge.
```

### Step 3: Check Local Info Files
```
Look for .md files in the project that document specific tools.
These contain domain-specific knowledge (e.g., pretext.md, STAKEHOLDERS.md).
```

---

## Golden Rule: Discover Before Building

### The Discovery Mandate
```
BEFORE implementing ANY feature that could use an external tool:

1. Classify the need (category from PROJECT_BOOTSTRAP.md)
2. Run the discovery protocol (DISCOVERY_PROTOCOL.md)
3. Find 3-5 current candidates
4. Score and compare them
5. Select the best fit
6. Only THEN begin implementation
```

### The Anti-Reinvention Rule
```
❌ NEVER implement from scratch:
   - Text measurement/layout (use Pretext or similar)
   - Virtual scrolling (use TanStack Virtual)
   - CRDTs/collaboration (use Yjs, Liveblocks)
   - Auth flows (use Better Auth, Authentik)
   - IFC/BIM parsing (use ifc.js)
   - Database search (use Meilisearch, Typesense)

✅ ALWAYS prefer integration:
   - Research latest solutions
   - Glue existing tools together
   - Customize via configuration/extension
   - Build only the unique business logic
```

---

## Search Patterns for Discovery

### When You Need...

#### High-Performance UI/Text
```
Search: "dom-free text measurement 2024"
Search: "virtual scroll {framework} 2025"
Check: Pretext, TanStack Virtual, react-virtuoso
Category: ui-layout
```

#### 3D/BIM/CAD
```
Search: "ifc javascript parser 2024"
Search: "web-based bim viewer open source"
Check: ifc.js, Three.js, Babylon.js, FreeCAD
Category: bim-cad
```

#### Real-Time Collaboration
```
Search: "yjs alternatives 2024"
Search: "websocket multiplayer {framework}"
Check: PartyKit, Yjs, Liveblocks, Socket.io v4
Category: real-time
```

#### Database/Storage
```
Search: "edge database 2025"
Search: "local-first database javascript"
Check: Turso, DuckDB-WASM, PGlite, rxdb
Category: database
```

#### AI/ML
```
Search: "local llm javascript 2024"
Search: "browser ai inference transformer"
Check: Transformers.js, WebLLM, Ollama, LangGraph
Category: ai-ml
```

#### Authentication
```
Search: "better auth alternatives 2024"
Search: "open source auth0 alternative"
Check: Better Auth, Authentik, Clerk
Category: auth
```

---

## Evaluation Scoring

### Always Score Candidates (0-10 each)

| Criterion | Weight | How to Check |
|-----------|--------|--------------|
| Activity | 25% | Last commit date, issue response time |
| Popularity | 15% | GitHub stars, npm downloads |
| Maintenance | 25% | Release frequency, security policy |
| Quality | 20% | Tests, types, docs, API design |
| Fit | 15% | Match to your specific need |

### Minimum Viable Score
```
If TOTAL < 6.0: Keep searching or consider building custom
If TOTAL 6.0-7.5: Viable but watch for issues
If TOTAL 7.5+: Good choice
If TOTAL 9.0+: Excellent choice, industry standard
```

---

## Red Flags - Stop and Reconsider

### Tool-Level Warnings
```
⚠️ Single maintainer, no succession plan
⚠️ "Looking for maintainers" in README
⚠️ No commits for 6+ months
⚠️ Security issues unaddressed
⚠️ License changed recently (BSL, SSPL)
⚠️ Major rewrite announced ("v2 coming soon")
```

### Integration Warnings
```
⚠️ No TypeScript definitions
⚠️ Bundle size > 100KB for simple feature
⚠️ Requires incompatible Node version
⚠️ Conflicts with your framework
⚠️ No error handling/debugging support
```

---

## Integration Patterns

### The Glue Philosophy
```typescript
// GOOD: Gluing specialized tools together
import { prepare, layout } from 'pretext'      // Text measurement
import * as THREE from 'three'                  // 3D rendering
import { IfcAPI } from 'web-ifc'               // IFC parsing
import { HNSW } from 'hnswlib-node'            // Vector search

// Your unique value: connecting them elegantly
export class BIMViewer {
  private pretext = new PretextEngine()
  private scene = new THREE.Scene()
  private ifc = new IfcAPI()
  // ... your orchestration logic
}
```

### The Wrapper Pattern
```typescript
// Wrap external tools for your domain
export class MechaningSearch {
  constructor(private meilisearch: MeiliSearch) {}
  
  // Domain-specific API, powered by generic tool
  async searchBIMElements(query: string, projectId: string) {
    return this.meilisearch.index('elements').search(query, {
      filter: `projectId = ${projectId}`
    })
  }
}
```

---

## Documentation Requirements

### When You Choose a Tool

1. **Document in TOOLS.md**:
```markdown
## {Tool Name}
**Chosen for**: {specific feature}
**Alternatives considered**: {list}
**Rationale**: {why this won}
**Version**: {pinned version}
**Risks**: {known issues}
```

2. **Add to Project AGENTS.md**:
```markdown
### {Category}
We use {Tool} for {use case}
Discovered: {date}
Next review: {date + 3 months}
```

3. **Pin Versions**:
```json
{
  "dependencies": {
    "{tool}": "^{major}.{minor}.0"
  }
}
```

---

## Category-Specific Rules

### UI/Layout
```
ALWAYS check Pretext before custom text measurement
ALWAYS check TanStack Virtual before custom virtual scrolling
ALWAYS check shadcn/ui or Radix before building components
Research: Observable Plot, Victory for charts
```

### 3D/BIM
```
ALWAYS check ifc.js before custom IFC parsing
ALWAYS check Three.js r150+ before custom WebGL
Research: Babylon.js for games, PlayCanvas for performance
```

### Database
```
ALWAYS check DuckDB-WASM for client-side analytics
ALWAYS check Turso for edge SQLite
ALWAYS check Meilisearch before custom search
Research: PGlite for in-browser Postgres
```

### AI/ML
```
ALWAYS check Transformers.js for browser ML
ALWAYS check Ollama for local LLMs
ALWAYS check LangGraph for agent workflows
Research: WebLLM for browser LLM inference
```

### Real-Time
```
ALWAYS check Yjs for collaborative editing
ALWAYS check PartyKit for multiplayer features
Research: Liveblocks for presence/storage/comments
```

---

## Quarterly Review Process

### Review Checklist
```
□ List all external dependencies
□ Check each tool's GitHub for updates
□ Run discovery protocol for critical tools
□ Check for security advisories
□ Review if better alternatives emerged
□ Update TOOLS.md with findings
```

### Migration Criteria
```
Consider migrating when:
- Current tool is archived/abandoned
- New alternative scores 2+ points higher
- Security issues unpatched
- Current tool blocks framework upgrade
- Maintenance burden exceeds value
```

---

## Emergency Overrides

### When You CAN Build Custom
```
✅ No existing tool in the category (truly novel)
✅ All candidates score < 4.0
✅ Integration complexity > custom build
✅ License incompatibility
✅ Extreme performance needs unmet by existing tools
```

### When to Prioritize Speed Over Discovery
```
⚡ Proof of concept (document tech debt)
⚡ Internal tool (revisit before production)
⚡ Known temporary solution
```

---

## Project Structure Convention

```
project_root/
├── PROJECT_BOOTSTRAP.md       # Start here
├── DISCOVERY_PROTOCOL.md      # How to discover
├── AGENTS.md                  # This file - project-specific rules
├── TOOLS.md                   # Document chosen tools
├── README.md                  # Project overview
└── .kimi/
    └── tools/
        ├── {tool-name}.md     # Detailed tool docs
        └── ...
```

---

## Remember

> **Your job is not to write all the code.**
> **Your job is to find the best existing solutions and connect them elegantly.**
>
> Kimi's knowledge has a cutoff. The world keeps innovating.
> Use the discovery protocol to stay current.
>
> When in doubt: SEARCH FIRST, CODE SECOND.

---

*Reference: STATE_OF_THE_ART_TOOLS.md for 100+ example tools*
