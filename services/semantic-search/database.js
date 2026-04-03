/**
 * Vector Database for Semantic Search
 * 
 * Uses SQLite with JSON extension for storing embeddings.
 * In production, use a proper vector database like:
 * - Pinecone
 * - Weaviate
 * - Qdrant
 * - pgvector
 */

import sqlite3 from 'sqlite3';
import sqlite from 'sqlite';
import { deserializeEmbedding } from './embeddings.js';

let db = null;

/**
 * Initialize the database
 */
export async function initDatabase(dbPath = './semantic_search.db') {
  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      description TEXT,
      keywords TEXT,
      embedding TEXT NOT NULL,
      score REAL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, platform)
    );
    
    CREATE INDEX IF NOT EXISTS idx_tools_platform ON tools(platform);
    CREATE INDEX IF NOT EXISTS idx_tools_score ON tools(score);
    
    CREATE TABLE IF NOT EXISTS search_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      embedding TEXT,
      results_count INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ Database initialized');
  return db;
}

/**
 * Insert or update a tool
 */
export async function upsertTool(tool) {
  const { name, platform, description, keywords, embedding, score, metadata } = tool;
  
  const existing = await db.get(
    'SELECT id FROM tools WHERE name = ? AND platform = ?',
    [name, platform]
  );
  
  if (existing) {
    // Update
    await db.run(
      `UPDATE tools 
       SET description = ?, keywords = ?, embedding = ?, score = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [description, JSON.stringify(keywords), JSON.stringify(embedding), score, JSON.stringify(metadata), existing.id]
    );
    return existing.id;
  } else {
    // Insert
    const result = await db.run(
      `INSERT INTO tools (name, platform, description, keywords, embedding, score, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, platform, description, JSON.stringify(keywords), JSON.stringify(embedding), score, JSON.stringify(metadata)]
    );
    return result.lastID;
  }
}

/**
 * Get all tools with embeddings
 */
export async function getAllTools() {
  const rows = await db.all('SELECT * FROM tools ORDER BY score DESC');
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    description: row.description,
    keywords: JSON.parse(row.keywords || '[]'),
    embedding: deserializeEmbedding(row.embedding),
    score: row.score,
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get tools by platform
 */
export async function getToolsByPlatform(platform) {
  const { deserializeEmbedding } = await import('./embeddings.js');
  const rows = await db.all(
    'SELECT * FROM tools WHERE platform = ? ORDER BY score DESC',
    [platform]
  );
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    description: row.description,
    keywords: JSON.parse(row.keywords || '[]'),
    embedding: deserializeEmbedding(row.embedding),
    score: row.score,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

/**
 * Get a single tool
 */
export async function getTool(name, platform) {
  const row = await db.get(
    'SELECT * FROM tools WHERE name = ? AND platform = ?',
    [name, platform]
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    platform: row.platform,
    description: row.description,
    keywords: JSON.parse(row.keywords || '[]'),
    embedding: deserializeEmbedding(row.embedding),
    score: row.score,
    metadata: JSON.parse(row.metadata || '{}')
  };
}

/**
 * Search tools by keyword (simple LIKE search)
 */
export async function searchByKeyword(keyword) {
  const rows = await db.all(
    `SELECT * FROM tools 
     WHERE name LIKE ? OR description LIKE ? OR keywords LIKE ?
     ORDER BY score DESC
     LIMIT 20`,
    [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
  );
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    description: row.description,
    keywords: JSON.parse(row.keywords || '[]'),
    embedding: deserializeEmbedding(row.embedding),
    score: row.score,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

/**
 * Log a search query
 */
export async function logQuery(query, embedding, resultsCount) {
  await db.run(
    'INSERT INTO search_queries (query, embedding, results_count) VALUES (?, ?, ?)',
    [query, embedding ? JSON.stringify(embedding) : null, resultsCount]
  );
}

/**
 * Get popular search queries
 */
export async function getPopularQueries(limit = 10) {
  return await db.all(
    `SELECT query, COUNT(*) as count 
     FROM search_queries 
     GROUP BY query 
     ORDER BY count DESC 
     LIMIT ?`,
    [limit]
  );
}

/**
 * Delete a tool
 */
export async function deleteTool(name, platform) {
  await db.run(
    'DELETE FROM tools WHERE name = ? AND platform = ?',
    [name, platform]
  );
}

/**
 * Get database stats
 */
export async function getStats() {
  const totalTools = await db.get('SELECT COUNT(*) as count FROM tools');
  const totalPlatforms = await db.get('SELECT COUNT(DISTINCT platform) as count FROM tools');
  const avgScore = await db.get('SELECT AVG(score) as avg FROM tools');
  const totalQueries = await db.get('SELECT COUNT(*) as count FROM search_queries');
  
  return {
    totalTools: totalTools.count,
    totalPlatforms: totalPlatforms.count,
    averageScore: avgScore.avg || 0,
    totalQueries: totalQueries.count
  };
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

export { db };
