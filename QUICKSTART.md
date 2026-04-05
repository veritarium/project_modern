# Project Modern - Quick Start

Get up and running in 5 minutes.

---

## Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack enable`)
- Docker & Docker Compose

---

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm turbo build

# 3. Start local services
docker-compose up -d
```

Services available:
- Evaluation API: http://localhost:3000
- Semantic Search: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Development Commands

```bash
# Type check
pnpm turbo typecheck

# Run tests
pnpm turbo test

# Lint
pnpm turbo lint

# Format code
pnpm format

# Start web dashboard only
pnpm --filter @projectmodern/web dev
```

---

## Using the CLI

```bash
# Evaluate a package
pnpm --filter @projectmodern/cli start search react

# Compare packages
pnpm --filter @projectmodern/cli start compare react vue

# Audit project dependencies
pnpm --filter @projectmodern/cli start audit
```

---

## API Examples

```bash
# Health check
curl http://localhost:3000/health

# Evaluate a package
curl http://localhost:3000/tools/npm/react

# Search
curl "http://localhost:3001/search?q=http+client"

# Find similar tools
curl http://localhost:3001/similar/npm/redux
```

---

## Environment Setup

Create `.env.local` for local development:

```bash
GITHUB_TOKEN=ghp_your_token
LIBRARIES_IO_API_KEY=your_key
OPENAI_API_KEY=sk-your_key
```

---

## Troubleshooting

### Port conflicts
```bash
# Check port usage
lsof -i :3000

# Stop all services
docker-compose down
```

### Rebuild after changes
```bash
pnpm turbo build --force
```

### Reset everything
```bash
docker-compose down -v
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm turbo build
```

---

**Ready to go!** See [STATUS.md](./STATUS.md) for current system status.
