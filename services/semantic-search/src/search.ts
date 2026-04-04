/**
 * Search Algorithms
 *
 * Hybrid search combining vector similarity and keyword matching.
 */

import type { DatabaseTool } from './database.js';
import { cosineSimilarity, generateEmbedding } from './embeddings.js';

interface SearchResult extends DatabaseTool {
  similarity: number;
  keywordScore: number;
  combinedScore: number;
  keywordMatches?: number;
}

/**
 * Categorize a query to understand intent
 */
export function categorizeQuery(query: string): string {
  const normalized = query.toLowerCase();

  const categories: Record<string, string[]> = {
    'ui-components': ['ui', 'component', 'button', 'modal', 'table', 'form', 'input', 'select'],
    'http-client': ['http', 'api', 'client', 'fetch', 'axios', 'request', 'rest', 'graphql'],
    'state-management': ['state', 'store', 'redux', 'mobx', 'zustand', 'context'],
    testing: ['test', 'testing', 'jest', 'vitest', 'cypress', 'playwright', 'mock'],
    styling: ['css', 'style', 'sass', 'less', 'tailwind', 'bootstrap', 'material'],
    animation: ['animation', 'motion', 'transition', 'gsap', 'framer', 'anime'],
    charts: ['chart', 'graph', 'plot', 'visualization', 'd3', 'recharts'],
    utilities: ['utils', 'lodash', 'date', 'format', 'parse', 'string', 'array'],
  };

  const scores: Record<string, number> = {};
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

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? (sorted[0]?.[0] ?? 'general') : 'general';
}

/**
 * Extract keywords from query
 */
export function extractKeywords(query: string): string[] {
  const normalized = query.toLowerCase();
  const words = normalized.split(/\s+/);

  // Filter out common stop words
  const stopWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
  ]);

  return words.filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Tool with similarity score (from vector search)
 */
interface ToolWithSimilarity extends DatabaseTool {
  similarity: number;
}

/**
 * Hybrid search: keyword + semantic
 */
export async function hybridSearch(
  query: string,
  options: {
    semanticResults?: ToolWithSimilarity[];
    keywordResults?: DatabaseTool[];
    topK?: number;
  } = {}
): Promise<SearchResult[]> {
  const { semanticResults = [], keywordResults = [], topK = 10 } = options;

  const keywords = extractKeywords(query);

  // Build combined result map
  const combined = new Map<string, SearchResult>();

  // Add semantic results with base score
  for (const result of semanticResults) {
    combined.set(result.id, {
      ...result,
      similarity: result.similarity || 0,
      keywordScore: 0,
      combinedScore: (result.similarity || 0) * 0.7,
    });
  }

  // Add/merge keyword results
  for (const result of keywordResults) {
    let keywordMatches = 0;
    const text =
      `${result.name} ${result.description} ${result.keywords?.join(' ') || ''}`.toLowerCase();

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        keywordMatches++;
      }
    }

    const keywordScore = keywords.length > 0 ? keywordMatches / keywords.length : 0;

    const existing = combined.get(result.id);
    if (existing) {
      existing.keywordScore = keywordScore;
      existing.keywordMatches = keywordMatches;
      existing.combinedScore = existing.similarity * 0.7 + keywordScore * 0.3;
    } else {
      combined.set(result.id, {
        ...result,
        similarity: 0,
        keywordScore,
        keywordMatches,
        combinedScore: keywordScore * 0.3,
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
export function findSimilarTools(
  tool: DatabaseTool,
  allTools: DatabaseTool[],
  topK = 5
): Array<{ id: string; name: string; platform: string; description: string; similarity: number }> {
  const others = allTools.filter((t) => t.id !== tool.id);

  const similarities = others.map((t) => ({
    id: t.id,
    name: t.name,
    platform: t.platform,
    description: t.description,
    similarity: cosineSimilarity(tool.embedding, t.embedding),
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}

export type { SearchResult };
