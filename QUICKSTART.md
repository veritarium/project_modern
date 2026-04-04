# Project Modern 2026 - Quick Start Checklist

> **Get from 0 to development in 30 minutes**

---

## Prerequisites

- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm 10+ installed (`pnpm --version`)
- [ ] Git configured
- [ ] GitHub CLI (optional but recommended)

---

## Step 1: Foundation Setup (10 minutes)

### 1.1 Initialize pnpm Workspace

```bash
# In project root
corepack enable
corepack prepare pnpm@10.0.0 --activate

# Create workspace file
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
  - 'extensions/*'
EOF
```

### 1.2 Root Package.json

```bash
cat > package.json << 'EOF'
{
  "name": "@projectmodern/root",
  "private": true,
  "version": "2.0.0",
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test",
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.0",
    "turbo": "^2.9.0",
    "typescript": "^5.8.0"
  }
}
EOF
```

### 1.3 Install Dependencies

```bash
pnpm install
```

---

## Step 2: Configure Tools (10 minutes)

### 2.1 Biome Configuration

```bash
cat > biome.json << 'EOF'
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
EOF
```

### 2.2 Turborepo Configuration

```bash
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV", "DATABASE_URL", "REDIS_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "typecheck": {},
    "dev": { "cache": false, "persistent": true }
  }
}
EOF
```

### 2.3 TypeScript Base Config

```bash
mkdir -p packages/config
cat > packages/config/tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF
```

---

## Step 3: Migrate Existing Code (10 minutes)

### 3.1 Create Directory Structure

```bash
mkdir -p apps/{api,web,cli}
mkdir -p packages/{types,api-client,config}
mkdir -p services/{evaluation,semantic-search}
mkdir -p extensions/vscode
```

### 3.2 Move Existing Code

```bash
# Move API (temporarily - will refactor later)
cp -r spikes/scorecard-integration/* services/evaluation/
rm -rf services/evaluation/node_modules services/evaluation/package-lock.json

# Move VS Code extension
cp -r extensions/vscode/* extensions/vscode/  # already in place
```

### 3.3 Update Evaluation Service Package.json

```bash
cat > services/evaluation/package.json << 'EOF'
{
  "name": "@projectmodern/evaluation-service",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@projectmodern/types": "workspace:*",
    "fastify": "^4.26.2",
    "node-fetch": "^3.3.2",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  }
}
EOF
```

---

## Step 4: First Development Run

### 4.1 Install Workspace Dependencies

```bash
pnpm install
```

### 4.2 Run Linting

```bash
# Should show no errors after migration
pnpm lint

# Auto-fix any issues
pnpm format
```

### 4.3 Start Development

```bash
# Start all services
pnpm dev

# Or individually
pnpm --filter @projectmodern/evaluation-service dev
```

---

## Verification Checklist

After completing the above:

- [ ] `pnpm install` completes without errors
- [ ] `pnpm lint` shows no errors (or fixable warnings)
- [ ] `pnpm build` succeeds
- [ ] Services start with `pnpm dev`
- [ ] API responds on http://localhost:3000/health
- [ ] TypeScript compiles without errors (`pnpm typecheck`)

---

## Next Steps

Once foundation is working:

1. **Week 2**: Extract shared packages (`types`, `api-client`)
2. **Week 3**: Migrate evaluation service to TypeScript
3. **Week 4**: Upgrade semantic search to OpenAI embeddings
4. **Week 5**: Create Next.js web app

See [PLAN_2026.md](./PLAN_2026.md) for full details.

---

## Troubleshooting

### Issue: "Cannot find module"

```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Biome format errors

```bash
# Auto-fix all format issues
pnpm format

# Or check specific file
pnpm biome check ./services/evaluation/src/server.js
```

### Issue: TypeScript errors

```bash
# Check specific package
cd services/evaluation
pnpm typecheck
```

### Issue: Port conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process or change port in .env
```

---

## Environment Variables Template

```bash
# .env.local (not committed)
cat > .env.local << 'EOF'
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/projectmodern
REDIS_URL=redis://localhost:6379

# APIs
GITHUB_TOKEN=ghp_your_token_here
LIBRARIES_IO_API_KEY=your_key_here
OPENAI_API_KEY=sk-your_key_here

# Auth (for web app)
NEXTAUTH_SECRET=random_string_here
NEXTAUTH_URL=http://localhost:3000
EOF
```

---

**Ready to start!** 🚀
