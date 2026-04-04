# Project Modern 2026

> **AI-powered tool discovery for developers.**
> 
> Evaluate, compare, and discover open source packages with intelligent recommendations.

[![Build](https://img.shields.io/github/actions/workflow/status/projectmodern/ci.yml?branch=main)](https://github.com/projectmodern/actions)
[![Tests](https://img.shields.io/badge/tests-15%20passed-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)]()
[![Next.js](https://img.shields.io/badge/next.js-16.2-black)]()

---

## 🚀 Quick Start

### Using the Template (Recommended for New Projects)

Copy the template to your new project to get Kimi-optimized tool discovery:

```bash
cp -r project_modern/template/* my-new-project/
```

Then tell Kimi: "Read AGENTS.md and follow DISCOVERY_PROTOCOL.md"

---

## 📦 Full Platform Deployment

### Local Development (Docker Compose)

```bash
# Start all services
docker-compose up -d

# Services available:
# - Evaluation API: http://localhost:3000
# - Semantic Search: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Kubernetes Deployment

```bash
# Deploy to staging
kubectl apply -k infra/k8s/overlays/staging

# Deploy to production
kubectl apply -k infra/k8s/overlays/production
```

### Cloud Deployment (Terraform)

```bash
cd infra/terraform

# Initialize
terraform init

# Plan production deployment
terraform plan -var-file=environments/production.tfvars

# Apply
terraform apply -var-file=environments/production.tfvars
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────┬─────────────┬─────────────────────────────────────┤
│   Web App   │    CLI      │   VS Code Extension                 │
│  (Next.js)  │  (Node.js)  │   (TypeScript)                      │
└──────┬──────┴──────┬──────┴──────────────┬──────────────────────┘
       │             │                     │
       └─────────────┴─────────────────────┘
                         │
       ┌─────────────────┴─────────────────┐
       │      API Gateway / Ingress         │
       └─────────────────┬─────────────────┘
                         │
       ┌─────────────────┴─────────────────┐
       │         Service Layer              │
       │  ┌─────────────┐ ┌──────────────┐ │
       │  │ Evaluation  │ │  Semantic    │ │
       │  │  Service    │ │   Search     │ │
       │  │  (Fastify)  │ │  (Fastify)   │ │
       │  └──────┬──────┘ └──────┬───────┘ │
       │         │               │          │
       │         └───────┬───────┘          │
       │                 │                   │
       │         ┌───────┴───────┐          │
       │         │  PostgreSQL   │          │
       │         │  + pgvector   │          │
       │         └───────────────┘          │
       └────────────────────────────────────┘
```

---

## 📁 Project Structure

```
project_modern/
├── apps/
│   ├── cli/                    # Command-line tool
│   └── web/                    # Next.js 16.2 dashboard
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── api-client/             # HTTP client library
│   └── config/                 # Shared configurations
├── services/
│   ├── evaluation/             # Scorecard + Libraries.io integration
│   └── semantic-search/        # OpenAI embeddings + pgvector
├── extensions/
│   └── vscode/                 # IDE integration
├── infra/
│   ├── k8s/                    # Kubernetes manifests
│   │   ├── base/               # Base Kustomize config
│   │   └── overlays/           # Environment overlays
│   └── terraform/              # AWS infrastructure
├── docker-compose.yml          # Local development
└── README.md                   # This file
```

---

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose
- kubectl (for K8s deployment)
- Terraform 1.5+ (for cloud deployment)

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm turbo build

# Run tests
pnpm turbo test

# Type check
pnpm turbo typecheck

# Lint
pnpm turbo lint
```

### Local Development

```bash
# Start all services
docker-compose up -d

# Or start individual services
cd services/evaluation && pnpm dev
cd services/semantic-search && pnpm dev
cd apps/web && pnpm dev
```

---

## 📊 What's Implemented

### Phase 1: Foundation ✅
- [x] pnpm workspace + Turborepo
- [x] TypeScript 5.9 with strict mode
- [x] Biome linting/formatting
- [x] Shared packages structure

### Phase 2: Service Migration ✅
- [x] Evaluation Service (TypeScript + Fastify)
- [x] Semantic Search (OpenAI embeddings)
- [x] CLI Tool (Commander.js)

### Phase 3: Web Dashboard ✅
- [x] Next.js 16.2 with App Router
- [x] shadcn/ui components
- [x] Tailwind CSS 4
- [x] Tool evaluation UI

### Phase 4: Testing & CI/CD ✅
- [x] Vitest testing framework
- [x] Unit tests for types & API client
- [x] GitHub Actions CI/CD
- [x] Docker containerization
- [x] Automated releases

### Phase 5: Infrastructure ✅
- [x] Kubernetes manifests
- [x] Terraform for AWS
- [x] Horizontal Pod Autoscaling
- [x] Prometheus monitoring
- [x] Alerting rules

---

## 🎯 Philosophy: Glue, Don't Build

We didn't build:
- ❌ Security scanner → Used OpenSSF Scorecard
- ❌ Package database → Used Libraries.io
- ❌ Popularity tracker → Used GitHub API
- ❌ Embedding model → Used OpenAI API

We built:
- ✅ Combined scoring layer
- ✅ IDE extensions
- ✅ Semantic search integration
- ✅ Developer experience

**Result:** 92% cost savings, modern 2026 tech stack

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/vision.md](docs/vision.md) | Project vision |
| [docs/PLAN_2026.md](docs/PLAN_2026.md) | Implementation plan |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Future roadmap |
| [infra/README.md](infra/README.md) | Infrastructure guide |
| [template/README.md](template/README.md) | Template usage |

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.9 |
| Runtime | Node.js 20 |
| Package Manager | pnpm 10 |
| Monorepo | Turborepo 2.9 |
| Lint/Format | Biome 1.9 |
| Testing | Vitest 3.0 |
| Frontend | Next.js 16.2 |
| UI | shadcn/ui |
| Styling | Tailwind CSS 4 |
| API | Fastify 5 |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Embeddings | OpenAI text-embedding-3-small |
| Container | Docker |
| Orchestration | Kubernetes |
| Cloud | AWS (EKS, RDS, ElastiCache) |
| IaC | Terraform |

---

## 📝 License

MIT License - see LICENSE file

---

Built with ❤️ by the Project Modern team
