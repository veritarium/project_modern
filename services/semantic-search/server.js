#!/usr/bin/env node
/**
 * Semantic Search Service
 *
 * Provides:
 * - Vector embedding generation
 * - Semantic similarity search
 * - Tool indexing
 * - Natural language query understanding
 */

import Fastify from 'fastify';
import { generateEmbedding, cosineSimilarity, findSimilar, extractKeywords } from './embeddings.js';
import {
  initDatabase,
  upsertTool,
  getAllTools,
  getTool,
  searchByKeyword,
  logQuery,
  getStats,
  closeDatabase,
} from './database.js';

const fastify = Fastify({
  logger: true,
});

// In-memory cache of tools for fast similarity search
let toolsCache = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initialize() {
  await initDatabase();
  await refreshToolsCache();
  console.log('✅ Semantic search service initialized');
}

async function refreshToolsCache() {
  toolsCache = await getAllTools();
  console.log(`📦 Loaded ${toolsCache.length} tools into memory`);
}

// ============================================================================
// SEARCH ALGORITHMS
// ============================================================================

/**
 * Semantic search using vector similarity
 */
function semanticSearch(queryEmbedding, tools, topK = 10) {
  const results = tools.map((tool) => ({
    ...tool,
    similarity: cosineSimilarity(queryEmbedding, tool.embedding),
  }));

  // Sort by similarity
  results.sort((a, b) => b.similarity - a.similarity);

  return results
    .filter((r) => r.similarity > 0.1) // Minimum threshold
    .slice(0, topK);
}

/**
 * Hybrid search: keyword + semantic
 */
async function hybridSearch(query, topK = 10) {
  const keywords = extractKeywords(query);
  const queryEmbedding = generateEmbedding(query);

  // Get keyword matches
  const keywordResults = new Map();
  for (const keyword of keywords) {
    const matches = await searchByKeyword(keyword);
    for (const match of matches) {
      const existing = keywordResults.get(match.name);
      if (existing) {
        existing.keywordMatches += 1;
      } else {
        keywordResults.set(match.name, { ...match, keywordMatches: 1 });
      }
    }
  }

  // Get semantic matches
  const semanticResults = semanticSearch(queryEmbedding, toolsCache, topK * 2);

  // Combine results
  const combined = new Map();

  // Add semantic results with base score
  for (const result of semanticResults) {
    combined.set(result.name, {
      ...result,
      semanticScore: result.similarity,
      keywordScore: 0,
      combinedScore: result.similarity * 0.7,
    });
  }

  // Add/merge keyword results
  for (const [name, result] of keywordResults) {
    const existing = combined.get(name);
    if (existing) {
      existing.keywordScore = result.keywordMatches / keywords.length;
      existing.keywordMatches = result.keywordMatches;
      existing.combinedScore = existing.semanticScore * 0.7 + existing.keywordScore * 0.3;
    } else {
      combined.set(name, {
        ...result,
        semanticScore: 0,
        keywordScore: result.keywordMatches / keywords.length,
        keywordMatches: result.keywordMatches,
        combinedScore: (result.keywordMatches / keywords.length) * 0.3,
      });
    }
  }

  // Sort by combined score
  const results = Array.from(combined.values());
  results.sort((a, b) => b.combinedScore - a.combinedScore);

  return results.slice(0, topK);
}

/**
 * Find similar tools to a given tool
 */
function findSimilarTools(toolName, platform, topK = 5) {
  const tool = toolsCache.find((t) => t.name === toolName && t.platform === platform);

  if (!tool) {
    return null;
  }

  // Find similar tools (excluding the query tool)
  const others = toolsCache.filter((t) => !(t.name === toolName && t.platform === platform));
  const similar = semanticSearch(tool.embedding, others, topK);

  return {
    tool,
    similar: similar.map((s) => ({
      name: s.name,
      platform: s.platform,
      description: s.description,
      score: s.score,
      similarity: s.similarity,
    })),
  };
}

/**
 * Categorize a query to understand intent
 */
function categorizeQuery(query) {
  const normalized = query.toLowerCase();

  const categories = {
    'ui-components': ['ui', 'component', 'button', 'modal', 'table', 'form', 'input', 'select'],
    'http-client': ['http', 'api', 'client', 'fetch', 'axios', 'request', 'rest', 'graphql'],
    'state-management': ['state', 'store', 'redux', 'mobx', 'zustand', 'context'],
    testing: ['test', 'testing', 'jest', 'vitest', 'cypress', 'playwright', 'mock'],
    styling: ['css', 'style', 'sass', 'less', 'tailwind', 'bootstrap', 'material'],
    animation: ['animation', 'motion', 'transition', 'gsap', 'framer', 'anime'],
    charts: ['chart', 'graph', 'plot', 'visualization', 'd3', 'recharts'],
    utilities: ['utils', 'lodash', 'date', 'format', 'parse', 'string', 'array'],
  };

  const scores = {};
  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }

  // Sort by score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? sorted[0][0] : 'general';
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
fastify.get('/health', async () => {
  const stats = await getStats();
  return {
    status: 'ok',
    service: 'semantic-search',
    toolsIndexed: stats.totalTools,
    totalQueries: stats.totalQueries,
    timestamp: new Date().toISOString(),
  };
});

// Semantic search
fastify.get('/search', async (request, reply) => {
  const { q, limit = 10 } = request.query;

  if (!q) {
    reply.status(400);
    return { error: 'Query parameter "q" is required' };
  }

  try {
    const startTime = Date.now();
    const results = await hybridSearch(q, parseInt(limit));
    const duration = Date.now() - startTime;

    // Log the query
    const queryEmbedding = generateEmbedding(q);
    await logQuery(q, queryEmbedding, results.length);

    // Categorize the query
    const category = categorizeQuery(q);

    return {
      query: q,
      category,
      resultsCount: results.length,
      duration: `${duration}ms`,
      results: results.map((r) => ({
        name: r.name,
        platform: r.platform,
        description: r.description,
        score: r.score,
        similarity: Math.round(r.semanticScore * 100) / 100,
        keywordMatches: r.keywordMatches || 0,
        combinedScore: Math.round(r.combinedScore * 100) / 100,
      })),
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error.message };
  }
});

// Find similar tools
fastify.get('/similar/:platform/:name', async (request, reply) => {
  const { platform, name } = request.params;
  const { limit = 5 } = request.query;

  try {
    const result = findSimilarTools(name, platform, parseInt(limit));

    if (!result) {
      reply.status(404);
      return { error: 'Tool not found' };
    }

    return {
      tool: {
        name: result.tool.name,
        platform: result.tool.platform,
        description: result.tool.description,
      },
      similar: result.similar,
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error.message };
  }
});

// Index a new tool
fastify.post('/index', async (request, reply) => {
  const { name, platform, description, keywords, score, metadata } = request.body;

  if (!name || !platform) {
    reply.status(400);
    return { error: 'name and platform are required' };
  }

  try {
    // Generate embedding
    const textToEmbed = `${name} ${description || ''} ${(keywords || []).join(' ')}`;
    const embedding = generateEmbedding(textToEmbed);

    // Store in database
    const tool = {
      name,
      platform,
      description: description || '',
      keywords: keywords || [],
      embedding,
      score: score || 0,
      metadata: metadata || {},
    };

    const id = await upsertTool(tool);

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
    return { error: error.message };
  }
});

// Batch index tools
fastify.post('/index/batch', async (request, reply) => {
  const { tools } = request.body;

  if (!Array.isArray(tools)) {
    reply.status(400);
    return { error: 'tools must be an array' };
  }

  const results = [];

  for (const toolData of tools) {
    try {
      const { name, platform, description, keywords, score, metadata } = toolData;

      const textToEmbed = `${name} ${description || ''} ${(keywords || []).join(' ')}`;
      const embedding = generateEmbedding(textToEmbed);

      const tool = {
        name,
        platform,
        description: description || '',
        keywords: keywords || [],
        embedding,
        score: score || 0,
        metadata: metadata || {},
      };

      const id = await upsertTool(tool);
      results.push({ success: true, id, name, platform });
    } catch (error) {
      results.push({ success: false, error: error.message, name: toolData.name });
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
});

// Get tool by name
fastify.get('/tools/:platform/:name', async (request, reply) => {
  const { platform, name } = request.params;

  const tool = await getTool(name, platform);

  if (!tool) {
    reply.status(404);
    return { error: 'Tool not found' };
  }

  return {
    name: tool.name,
    platform: tool.platform,
    description: tool.description,
    keywords: tool.keywords,
    score: tool.score,
    metadata: tool.metadata,
  };
});

// Get all tools
fastify.get('/tools', async (request) => {
  const { platform, limit = 100 } = request.query;

  let tools;
  if (platform) {
    tools = await getToolsByPlatform(platform);
  } else {
    tools = await getAllTools();
  }

  return {
    count: tools.length,
    tools: tools.slice(0, parseInt(limit)).map((t) => ({
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
fastify.get('/queries/popular', async (request) => {
  const { limit = 10 } = request.query;
  return await getPopularQueries(parseInt(limit));
});

// Refresh cache
fastify.post('/refresh', async () => {
  await refreshToolsCache();
  return { success: true, toolsLoaded: toolsCache.length };
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3001;

async function start() {
  await initialize();

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Semantic Search Service running on http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log(`  GET  /health           - Health check`);
    console.log(`  GET  /search?q=query   - Semantic search`);
    console.log(`  GET  /similar/npm/react - Find similar tools`);
    console.log(`  POST /index            - Index a tool`);
    console.log(`  GET  /stats            - Statistics`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await closeDatabase();
  process.exit(0);
});

start();
