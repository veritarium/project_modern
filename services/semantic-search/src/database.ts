/**
 * PostgreSQL Database with pgvector
 *
 * Stores tool embeddings and supports vector similarity search.
 */

import pg from 'pg';
import type { Tool } from '@projectmodern/types';

const { Pool } = pg;

interface DatabaseTool {
  id: string;
  name: string;
  platform: string;
  description: string;
  keywords: string[];
  embedding: number[];
  score: number;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface QueryLog {
  id: number;
  query: string;
  embedding: number[];
  results_count: number;
  created_at: Date;
}

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

/**
 * Initialize database with required extensions and tables
 */
export async function initDatabase(): Promise<void> {
  const client = await getPool().connect();

  try {
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // Create tools table with vector column
    await client.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        description TEXT DEFAULT '',
        keywords TEXT[] DEFAULT '{}',
        embedding vector(1536),
        score REAL DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for vector similarity search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tools_embedding 
      ON tools USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);

    // Create query log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS query_logs (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        embedding vector(1536),
        results_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for platform/name lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tools_platform_name 
      ON tools(platform, name);
    `);

    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
}

/**
 * Insert or update a tool
 */
export async function upsertTool(
  id: string,
  tool: Omit<DatabaseTool, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const client = await getPool().connect();

  try {
    const embeddingStr = `[${tool.embedding.join(',')}]`;

    await client.query(
      `
      INSERT INTO tools (id, name, platform, description, keywords, embedding, score, metadata)
      VALUES ($1, $2, $3, $4, $5, $6::vector, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        keywords = EXCLUDED.keywords,
        embedding = EXCLUDED.embedding,
        score = EXCLUDED.score,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
    `,
      [
        id,
        tool.name,
        tool.platform,
        tool.description,
        tool.keywords,
        embeddingStr,
        tool.score,
        JSON.stringify(tool.metadata),
      ]
    );
  } finally {
    client.release();
  }
}

/**
 * Get tool by ID
 */
export async function getTool(id: string): Promise<DatabaseTool | null> {
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
      SELECT id, name, platform, description, keywords, 
             embedding::text as embedding, score, metadata, created_at, updated_at
      FROM tools WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      embedding: parseVector(row.embedding),
      keywords: row.keywords || [],
    };
  } finally {
    client.release();
  }
}

/**
 * Search tools by vector similarity
 */
export async function searchByVector(
  embedding: number[],
  limit = 10,
  minSimilarity = 0.1
): Promise<Array<DatabaseTool & { similarity: number }>> {
  const client = await getPool().connect();

  try {
    const embeddingStr = `[${embedding.join(',')}]`;

    const result = await client.query(
      `
      SELECT id, name, platform, description, keywords,
             embedding::text as embedding, score, metadata, created_at, updated_at,
             1 - (embedding <=> $1::vector) as similarity
      FROM tools
      WHERE 1 - (embedding <=> $1::vector) > $3
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `,
      [embeddingStr, limit, minSimilarity]
    );

    return result.rows.map((row) => ({
      ...row,
      embedding: parseVector(row.embedding),
      keywords: row.keywords || [],
      similarity: parseFloat(row.similarity),
    }));
  } finally {
    client.release();
  }
}

/**
 * Search tools by keywords
 */
export async function searchByKeyword(keyword: string, limit = 10): Promise<DatabaseTool[]> {
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
      SELECT id, name, platform, description, keywords,
             embedding::text as embedding, score, metadata, created_at, updated_at
      FROM tools
      WHERE 
        name ILIKE $1 OR
        description ILIKE $1 OR
        $2 = ANY(keywords)
      ORDER BY score DESC
      LIMIT $3
    `,
      [`%${keyword}%`, keyword.toLowerCase(), limit]
    );

    return result.rows.map((row) => ({
      ...row,
      embedding: parseVector(row.embedding),
      keywords: row.keywords || [],
    }));
  } finally {
    client.release();
  }
}

/**
 * Get all tools (with limit)
 */
export async function getAllTools(limit = 10000): Promise<DatabaseTool[]> {
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
      SELECT id, name, platform, description, keywords,
             embedding::text as embedding, score, metadata, created_at, updated_at
      FROM tools
      ORDER BY score DESC
      LIMIT $1
    `,
      [limit]
    );

    return result.rows.map((row) => ({
      ...row,
      embedding: parseVector(row.embedding),
      keywords: row.keywords || [],
    }));
  } finally {
    client.release();
  }
}

/**
 * Log a search query
 */
export async function logQuery(
  query: string,
  embedding: number[],
  resultsCount: number
): Promise<void> {
  const client = await getPool().connect();

  try {
    const embeddingStr = `[${embedding.join(',')}]`;

    await client.query(
      `
      INSERT INTO query_logs (query, embedding, results_count)
      VALUES ($1, $2::vector, $3)
    `,
      [query, embeddingStr, resultsCount]
    );
  } finally {
    client.release();
  }
}

/**
 * Get popular queries
 */
export async function getPopularQueries(
  limit = 10
): Promise<Array<{ query: string; count: number }>> {
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
      SELECT query, COUNT(*) as count
      FROM query_logs
      GROUP BY query
      ORDER BY count DESC
      LIMIT $1
    `,
      [limit]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get database stats
 */
export async function getStats(): Promise<{
  totalTools: number;
  totalQueries: number;
}> {
  const client = await getPool().connect();

  try {
    const toolsResult = await client.query('SELECT COUNT(*) as count FROM tools');
    const queriesResult = await client.query('SELECT COUNT(*) as count FROM query_logs');

    return {
      totalTools: parseInt(toolsResult.rows[0].count, 10),
      totalQueries: parseInt(queriesResult.rows[0].count, 10),
    };
  } finally {
    client.release();
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Parse PostgreSQL vector string to number array
 */
function parseVector(vectorString: string): number[] {
  if (!vectorString) return [];
  const cleaned = vectorString.replace(/^[\[\(]|[\]\)]$/g, '');
  return cleaned.split(',').map((s) => parseFloat(s.trim()));
}

export type { DatabaseTool, QueryLog };
