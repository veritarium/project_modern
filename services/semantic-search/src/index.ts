#!/usr/bin/env node
/**
 * Project Modern - Semantic Search Service
 * Fastify API with OpenAI embeddings and PostgreSQL pgvector
 */

import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import {
  initDatabase,
  closeDatabase,
  upsertTool,
  getTool,
  searchByVector,
  searchByKeyword,
  getAllTools,
  logQuery,
  getStats,
  getPopularQueries,
  type DatabaseTool,
} from './database.js';
import { generateEmbedding, generateEmbeddingsBatch, EMBEDDING_DIM } from './embeddings.js';
import { hybridSearch, categorizeQuery, findSimilarTools } from './search.js';

// ============================================================================
// Configuration
// ============================================================================

interface Config {
  port: number;
  databaseUrl: string;
  openaiApiKey: string | undefined;
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/projectmodern',
  openaiApiKey: process.env.OPENAI_API_KEY,
};

// ============================================================================
// Fastify App
// ============================================================================

const fastify: FastifyInstance = Fastify({
  logger: true,
});

// In-memory cache of tools for fast similarity search
let toolsCache: DatabaseTool[] = [];

// ============================================================================
// Initialization
// ============================================================================

async function initialize(): Promise<void> {
  await initDatabase();
  await refreshToolsCache();
  fastify.log.info('✅ Semantic search service initialized');
}

async function refreshToolsCache(): Promise<void> {
  toolsCache = await getAllTools(10000);
  fastify.log.info(`📦 Loaded ${toolsCache.length} tools into memory`);
}

// ============================================================================
// API Routes
// ============================================================================

// Health check
fastify.get('/health', async () => {
  const stats = await getStats();
  return {
    status: 'ok',
    service: 'semantic-search',
    embeddingModel: 'text-embedding-3-small',
    embeddingDimension: EMBEDDING_DIM,
    toolsIndexed: stats.totalTools,
    totalQueries: stats.totalQueries,
    timestamp: new Date().toISOString(),
  };
});

// Semantic search
fastify.get<{
  Querystring: { q: string; limit?: string; minScore?: string };
}>('/search', async (request, reply) => {
  const { q, limit = '10', minScore = '0.1' } = request.query;

  if (!q) {
    reply.status(400);
    return { error: 'Query parameter "q" is required' };
  }

  if (!config.openaiApiKey) {
    reply.status(503);
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const startTime = Date.now();

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(q);

    // Get semantic results from database
    const semanticResults = await searchByVector(
      queryEmbedding,
      parseInt(limit, 10) * 2,
      parseFloat(minScore)
    );

    // Get keyword results
    const keywords = q.split(/\s+/);
    const keywordResults: DatabaseTool[] = [];
    for (const keyword of keywords) {
      if (keyword.length > 2) {
        const results = await searchByKeyword(keyword, 20);
        keywordResults.push(...results);
      }
    }

    // Combine results
    const results = await hybridSearch(q, {
      semanticResults,
      keywordResults,
      topK: parseInt(limit, 10),
    });

    const duration = Date.now() - startTime;

    // Log the query
    await logQuery(q, queryEmbedding, results.length);

    // Categorize the query
    const category = categorizeQuery(q);

    return {
      query: q,
      category,
      resultsCount: results.length,
      duration: `${duration}ms`,
      results: results.map((r) => ({
        id: r.id,
        name: r.name,
        platform: r.platform,
        description: r.description,
        score: r.score,
        similarity: Math.round(r.similarity * 100) / 100,
        keywordMatches: r.keywordMatches || 0,
        combinedScore: Math.round(r.combinedScore * 100) / 100,
      })),
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Find similar tools
fastify.get<{
  Params: { platform: string; name: string };
  Querystring: { limit?: string };
}>('/similar/:platform/:name', async (request, reply) => {
  const { platform, name } = request.params;
  const { limit = '5' } = request.query;
  const id = `${platform}/${name}`;

  try {
    const tool = await getTool(id);

    if (!tool) {
      reply.status(404);
      return { error: 'Tool not found' };
    }

    const similar = findSimilarTools(tool, toolsCache, parseInt(limit, 10));

    return {
      tool: {
        id: tool.id,
        name: tool.name,
        platform: tool.platform,
        description: tool.description,
      },
      similar,
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Index a new tool
fastify.post<{
  Body: {
    name: string;
    platform: string;
    description?: string;
    keywords?: string[];
    score?: number;
    metadata?: Record<string, unknown>;
  };
}>('/index', async (request, reply) => {
  const {
    name,
    platform,
    description = '',
    keywords = [],
    score = 0,
    metadata = {},
  } = request.body;

  if (!name || !platform) {
    reply.status(400);
    return { error: 'name and platform are required' };
  }

  if (!config.openaiApiKey) {
    reply.status(503);
    return { error: 'OpenAI API key not configured' };
  }

  try {
    // Generate embedding
    const textToEmbed = `${name} ${description} ${keywords.join(' ')}`;
    const embedding = await generateEmbedding(textToEmbed);

    // Store in database
    const id = `${platform}/${name}`;
    await upsertTool(id, {
      name,
      platform,
      description,
      keywords,
      embedding,
      score,
      metadata,
    });

    // Refresh cache
    await refreshToolsCache();

    return {
      success: true,
      id,
      name,
      platform,
      embeddingDimension: embedding.length,
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Batch index tools
fastify.post<{
  Body: {
    tools: Array<{
      name: string;
      platform: string;
      description?: string;
      keywords?: string[];
      score?: number;
      metadata?: Record<string, unknown>;
    }>;
  };
}>('/index/batch', async (request, reply) => {
  const { tools } = request.body;

  if (!Array.isArray(tools)) {
    reply.status(400);
    return { error: 'tools must be an array' };
  }

  if (!config.openaiApiKey) {
    reply.status(503);
    return { error: 'OpenAI API key not configured' };
  }

  const results = [];

  // Generate embeddings in batches
  const textsToEmbed = tools.map(
    (t) => `${t.name} ${t.description || ''} ${(t.keywords || []).join(' ')}`
  );

  try {
    const embeddings = await generateEmbeddingsBatch(textsToEmbed);

    for (let i = 0; i < tools.length; i++) {
      const toolData = tools[i];
      const embedding = embeddings[i];

      if (!toolData) {
        results.push({ success: false, error: 'Tool data is undefined' });
        continue;
      }

      try {
        const id = `${toolData.platform}/${toolData.name}`;
        await upsertTool(id, {
          name: toolData.name,
          platform: toolData.platform,
          description: toolData.description || '',
          keywords: toolData.keywords || [],
          embedding: embedding ?? new Array(1536).fill(0),
          score: toolData.score || 0,
          metadata: toolData.metadata || {},
        });
        results.push({ success: true, id, name: toolData.name, platform: toolData.platform });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          name: toolData.name,
        });
      }
    }

    // Refresh cache
    await refreshToolsCache();

    return {
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Get tool by name
fastify.get<{
  Params: { platform: string; name: string };
}>('/tools/:platform/:name', async (request, reply) => {
  const { platform, name } = request.params;
  const id = `${platform}/${name}`;

  const tool = await getTool(id);

  if (!tool) {
    reply.status(404);
    return { error: 'Tool not found' };
  }

  return {
    id: tool.id,
    name: tool.name,
    platform: tool.platform,
    description: tool.description,
    keywords: tool.keywords,
    score: tool.score,
    metadata: tool.metadata,
  };
});

// Get all tools
fastify.get<{
  Querystring: { platform?: string; limit?: string };
}>('/tools', async (request) => {
  const { limit = '100' } = request.query;
  const tools = await getAllTools(parseInt(limit, 10));

  return {
    count: tools.length,
    tools: tools.map((t) => ({
      id: t.id,
      name: t.name,
      platform: t.platform,
      description: t.description,
      score: t.score,
    })),
  };
});

// Get stats
fastify.get('/stats', async () => {
  return await getStats();
});

// Get popular queries
fastify.get<{
  Querystring: { limit?: string };
}>('/queries/popular', async (request) => {
  const { limit = '10' } = request.query;
  return await getPopularQueries(parseInt(limit, 10));
});

// Refresh cache
fastify.post('/refresh', async () => {
  await refreshToolsCache();
  return { success: true, toolsLoaded: toolsCache.length };
});

// ============================================================================
// Start Server
// ============================================================================

async function start(): Promise<void> {
  // Validate configuration
  if (!config.openaiApiKey) {
    fastify.log.warn('⚠️  OPENAI_API_KEY not set - semantic search will be unavailable');
  }

  try {
    await initialize();

    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`\n🚀 Semantic Search Service running on http://localhost:${config.port}`);
    fastify.log.info('\nEndpoints:');
    fastify.log.info('  GET  /health           - Health check');
    fastify.log.info('  GET  /search?q=query   - Semantic search');
    fastify.log.info('  GET  /similar/npm/react - Find similar tools');
    fastify.log.info('  POST /index            - Index a tool');
    fastify.log.info('  GET  /stats            - Statistics');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('\n👋 Shutting down...');
  await closeDatabase();
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('\n👋 Shutting down...');
  await closeDatabase();
  await fastify.close();
  process.exit(0);
});

start();
