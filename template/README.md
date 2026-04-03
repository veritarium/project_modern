# Project Modern Template

Copy these files to your new project to instruct Kimi to use the discovery protocol.

## Quick Start

1. **Copy all files from this folder** to your new project root:
   ```bash
   cp -r template/* /path/to/your/new/project/
   ```

2. **Create a TOOLS.md file** in your project:
   ```bash
   touch TOOLS.md
   ```

3. **When starting with Kimi, say:**
   > "Read AGENTS.md and PROJECT_BOOTSTRAP.md first, then follow the DISCOVERY_PROTOCOL.md before implementing any feature."

## Files Explained

| File | Purpose |
|------|---------|
| `AGENTS.md` | Rules for Kimi to follow when working on this project |
| `PROJECT_BOOTSTRAP.md` | Reference list of modern tools by category |
| `DISCOVERY_PROTOCOL.md` | How to discover and evaluate tools |
| `TOOL_TEMPLATE.md` | Template for documenting discovered tools |
| `TOOLS.md` | (You create this) Documents your project's tool choices |

## Example TOOLS.md

```markdown
# Project Tools

## Frontend Framework
**Chosen:** React 18
**Alternatives considered:** Vue, Angular, Svelte
**Rationale:** Team expertise, ecosystem size

## State Management
**Chosen:** Zustand
**Alternatives considered:** Redux, MobX
**Rationale:** Lightweight, TypeScript support
```

## Workflow

### When you need a new tool:

1. **Classify** the need (from PROJECT_BOOTSTRAP.md)
2. **Search** using patterns in DISCOVERY_PROTOCOL.md
3. **Evaluate** 3-5 candidates
4. **Select** the best fit
5. **Document** in TOOLS.md using TOOL_TEMPLATE.md

### Example prompt for Kimi:

```
I need to add user authentication to this React app.

First, read AGENTS.md and PROJECT_BOOTSTRAP.md.
Then follow DISCOVERY_PROTOCOL.md to find the best authentication solution.
Consider: Better Auth, Auth0, Clerk, or Supabase Auth.

Document your choice in TOOLS.md.
```

## What Kimi Will Do

With these files in place, Kimi will:
- ✅ Check PROJECT_BOOTSTRAP.md before suggesting outdated tools
- ✅ Follow DISCOVERY_PROTOCOL.md to evaluate options
- ✅ Not reinvent wheels (use existing solutions)
- ✅ Document choices in TOOLS.md

## Optional: Use the CLI/API

If you want automatic tool scoring, you can also:
1. Start the Project Modern API locally
2. Use the CLI: `modern search <package>`
3. Or use the VS Code Extension

See the main repository for those features.

---

*This template is minimal and focused. Just the docs, no code needed.*
