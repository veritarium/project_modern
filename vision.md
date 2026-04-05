# Project Modern - Vision

AI-powered tool discovery platform that helps developers evaluate, compare, and choose open source packages.

---

## What We Built

A working platform that automatically evaluates open source packages using multiple data sources:

- **Evaluation Service**: Aggregates security (OpenSSF Scorecard), maintenance (Libraries.io), and popularity (GitHub) metrics into a composite score
- **Semantic Search**: AI-powered natural language search using OpenAI embeddings
- **Web Dashboard**: Next.js 16.2 interface for searching and comparing tools
- **CLI Tool**: Command-line interface for audits and comparisons
- **VS Code Extension**: IDE integration with hover info and diagnostics

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interfaces                       │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│   │   Web    │  │   CLI    │  │  VS Code Ext     │     │
│   │ Next.js  │  │Commander │  │  TypeScript      │     │
│   └────┬─────┘  └────┬─────┘  └────────┬─────────┘     │
└────────┼─────────────┼─────────────────┼───────────────┘
         │             │                 │
         └─────────────┴─────────────────┘
                           │
              ┌────────────┴────────────┐
              │     Service Layer        │
              │  ┌─────────┐ ┌────────┐  │
              │  │Evaluation│ │Semantic│  │
              │  │Service   │ │Search  │  │
              │  │:3000     │ │:3001   │  │
              │  └────┬────┘ └───┬────┘  │
              │       └────┬─────┘       │
              │            │             │
              │       ┌────┴────┐        │
              │       │PostgreSQL│       │
              │       │+pgvector │       │
              │       └─────────┘        │
              └──────────────────────────┘
```

---

## Data Sources

| Source | Data Provided |
|--------|---------------|
| OpenSSF Scorecard | Security scoring (18 checks) |
| Libraries.io | Package metadata, maintenance status |
| GitHub API | Stars, forks, activity metrics |
| OpenAI API | Text embeddings for semantic search |

---

## Composite Scoring

```
Composite Score = 
  (Security × 0.30) +      // From Scorecard
  (Maintenance × 0.25) +   // From Libraries.io
  (Popularity × 0.25) +    // From GitHub
  (Ecosystem × 0.20)       // From Libraries.io

Grade: A (8-10), B (6-8), C (4-6), D (2-4), F (0-2)
```

---

## Key Features

### Semantic Search
Traditional search: "react" → React  
Our search: "frontend framework for UIs" → React, Vue, Angular, Svelte

### Tool Comparison
Side-by-side comparison with visual breakdown of scores across all dimensions.

### IDE Integration
Hover over `package.json` dependencies to see scores and warnings directly in VS Code.

### Project Audit
Analyze entire `package.json` files to identify problematic dependencies.

---

## Philosophy: Glue, Don't Build

| Component | Used | Built Custom |
|-----------|------|--------------|
| Security scanning | OpenSSF Scorecard | ❌ |
| Package database | Libraries.io | ❌ |
| Popularity metrics | GitHub API | ❌ |
| Embeddings | OpenAI API | ❌ |
| Vector storage | PostgreSQL + pgvector | ❌ |
| **Our focus:** | | |
| Scoring algorithm | ✅ Custom |
| Developer UX | ✅ Custom |
| IDE integrations | ✅ Custom |
| Search interface | ✅ Custom |

---

## Tech Stack

- **TypeScript 5.9** with strict mode (`erasableSyntaxOnly`, `exactOptionalPropertyTypes`)
- **pnpm** workspaces with Turborepo
- **Biome** for linting/formatting
- **Next.js 16.2** + shadcn/ui + Tailwind CSS 4
- **Fastify 5** for APIs
- **PostgreSQL 16** + pgvector
- **Redis 7** for caching
- **Kubernetes** + Terraform for infrastructure

---

## Project Structure

```
apps/
  cli/              # Commander.js CLI
  web/              # Next.js dashboard
packages/
  types/            # Shared types
  api-client/       # HTTP client
  config/           # Shared configs
services/
  evaluation/       # Scorecard + Libraries.io + GitHub
  semantic-search/  # OpenAI + pgvector
extensions/
  vscode/           # IDE extension
infra/
  k8s/              # Kubernetes manifests
  terraform/        # AWS infrastructure
```

---

## Status

Production-ready with all core features implemented. See [STATUS.md](./STATUS.md) for details.

---

## License

MIT License
