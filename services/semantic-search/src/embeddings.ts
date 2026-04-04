/**
 * OpenAI Embeddings Service
 *
 * Generates vector embeddings using OpenAI's text-embedding-3-small model.
 * 1536 dimensions, superior semantic understanding.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

/**
 * Generate a vector embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(EMBEDDING_DIM).fill(0);
  }

  // Truncate to 8000 characters (approximate token limit safety)
  const truncated = text.slice(0, 8000);

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncated,
    encoding_format: 'float',
  });

  return response.data[0]?.embedding ?? new Array(EMBEDDING_DIM).fill(0);
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
    encoding_format: 'float',
  });

  return response.data.map((d) => d.embedding ?? new Array(EMBEDDING_DIM).fill(0));
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same dimension');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    const v1 = embedding1[i] ?? 0;
    const v2 = embedding2[i] ?? 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Calculate Euclidean distance between two embeddings
 */
export function euclideanDistance(embedding1: number[], embedding2: number[]): number {
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = (embedding1[i] ?? 0) - (embedding2[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Find similar embeddings using cosine similarity
 */
export function findSimilar(
  queryEmbedding: number[],
  embeddings: Array<{ id: string; embedding: number[] }>,
  topK = 10
): Array<{ id: string; similarity: number }> {
  const similarities = embeddings.map((item) => ({
    id: item.id,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}

/**
 * Serialize embedding to PostgreSQL vector format
 */
export function serializeEmbedding(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Deserialize embedding from PostgreSQL vector format
 */
export function deserializeEmbedding(vectorString: string): number[] {
  const cleaned = vectorString.replace(/^\[|\]$/g, '');
  return cleaned.split(',').map((s) => parseFloat(s.trim()));
}

export { EMBEDDING_DIM, EMBEDDING_MODEL };
