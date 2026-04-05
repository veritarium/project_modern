# Project Modern

AI-powered tool discovery platform for evaluating, comparing, and discovering open source packages.

[![Build](https://img.shields.io/github/actions/workflow/status/projectmodern/ci.yml?branch=main)](https://github.com/projectmodern/actions)
[![Tests](https://img.shields.io/badge/tests-15%20passed-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)]()
[![Next.js](https://img.shields.io/badge/next.js-16.2-black)]()

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack enable`)
- Docker & Docker Compose (for local services)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm turbo build

# Start local services (PostgreSQL, Redis, APIs)
docker-compose up -d
```

### Development Commands

```bash
# Run all tests
pnpm turbo test

# Type check
pnpm turbo typecheck

# Lint and format
pnpm turbo lint
pnpm format

# Start web dashboard
pnpm --filter @projectmodern/web dev
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                           │
├─────────────┬─────────────┬──────────────────────────────────┤
│   Web App   │    CLI      │   VS Code Extension              │
│  (Next.js)  │  (Node.js)  │   (TypeScript)                   │
└──────┬──────┴──────┬──────┴──────────────┬───────────────────┘
       │             │                     │
       └─────────────┴─────────────────────┘
                         │
       ┌─────────────────┴─────────────────┐
       │         Service Layer              │
       │  ┌─────────────┐ ┌──────────────┐  │
       │  │ Evaluation  │ │  Semantic    │  │
       │  │  Service    │ │   Search     │  │
       │  │  :3000      │ │   :3001      │  │
       │  └──────┬──────┘ └──────┬───────┘  │
       │         │               │          │
       │         └───────┬───────┘          │
       │                 │                  │
       │         ┌───────┴───────┐          │
       │         │  PostgreSQL   │          │
       │         │  + pgvector   │          │
       │         └───────────────┘          │
       └────────────────────────────────────┘
```

---

## Project Structure

```
project_modern/
├── apps/
│   ├── cli/                    # CLI tool (Commander.js)
│   └── web/                    # Next.js 16.2 dashboard
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── api-client/             # HTTP client library
│   └── config/                 # Shared configurations
├── services/
│   ├── evaluation/             # Scorecard + Libraries.io API
│   └── semantic-search/        # OpenAI embeddings + pgvector
├── extensions/
│   └── vscode/                 # VS Code extension
├── infra/
│   ├── k8s/                    # Kubernetes manifests
│   └── terraform/              # AWS infrastructure
└── docker-compose.yml          # Local development
```

---

## Features

- **Package Evaluation**: Composite scoring from security, maintenance, popularity, ecosystem metrics
- **Semantic Search**: Natural language tool discovery using OpenAI embeddings
- **Tool Comparison**: Side-by-side comparison with visual breakdowns
- **IDE Integration**: VS Code extension with hover info and diagnostics
- **CLI Tool**: Command-line audit and comparison

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.9 (strict mode) |
| Runtime | Node.js 20 |
| Package Manager | pnpm 10 |
| Monorepo | Turborepo 2.9 |
| Lint/Format | Biome 1.9 |
| Testing | Vitest 3.0 |
| Frontend | Next.js 16.2 + shadcn/ui + Tailwind CSS 4 |
| API | Fastify 5 |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Embeddings | OpenAI text-embedding-3-small |
| Infrastructure | Kubernetes (EKS) + Terraform |

---

## API Endpoints

### Evaluation Service (`:3000`)

```bash
GET /health                          # Health check
GET /tools/:platform/:name           # Evaluate a package
POST /compare                        # Compare multiple packages
```

### Semantic Search Service (`:3001`)

```bash
GET /health                          # Health check
GET /search?q=query                  # Natural language search
GET /similar/:platform/:name         # Find similar tools
POST /index                          # Index a tool
```

---

## Deployment

### Local (Docker Compose)

```bash
docker-compose up -d
```

### Kubernetes

```bash
# Staging
kubectl apply -k infra/k8s/overlays/staging

# Production
kubectl apply -k infra/k8s/overlays/production
```

### AWS (Terraform)

```bash
cd infra/terraform
terraform init
terraform apply -var-file=environments/production.tfvars
```

---

## Philosophy: Glue, Don't Build

- **Security**: OpenSSF Scorecard (not a custom scanner)
- **Package Data**: Libraries.io (not a custom database)
- **Popularity**: GitHub API (not a custom tracker)
- **Embeddings**: OpenAI API (not a custom model)

Focus on unique value: scoring algorithm, UX, integrations.

---

## License

MIT License
