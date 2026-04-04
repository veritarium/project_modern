# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY services/evaluation/ ./services/evaluation/

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@projectmodern/evaluation-service

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Copy built application
COPY --from=builder /app/services/evaluation/dist ./dist
COPY --from=builder /app/services/evaluation/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "dist/index.js"]
