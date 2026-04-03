/**
 * Vector Embeddings Service
 * 
 * Generates embeddings for text descriptions using a simple
 * but effective approach. In production, this would use:
 * - OpenAI Embeddings API
 * - Hugging Face Transformers
 * - Local LLM embeddings
 */

import { createHash } from 'crypto';

// Simple vocabulary for basic embeddings
const VOCABULARY = new Map([
  // Frameworks
  ['react', 0], ['vue', 1], ['angular', 2], ['svelte', 3],
  ['next', 4], ['nuxt', 5], ['express', 6], ['fastify', 7],
  ['nest', 8], ['django', 9], ['flask', 10], ['rails', 11],
  ['laravel', 12], ['spring', 13], ['dotnet', 14],
  
  // UI/Components
  ['ui', 50], ['component', 51], ['button', 52], ['modal', 53],
  ['table', 54], ['grid', 55], ['chart', 56], ['form', 57],
  ['input', 58], ['select', 59], ['dialog', 60], ['tooltip', 61],
  ['menu', 62], ['tab', 63], ['card', 64], ['list', 65],
  
  // Functionality
  ['http', 100], ['api', 101], ['rest', 102], ['graphql', 103],
  ['websocket', 104], ['database', 105], ['sql', 106], ['nosql', 107],
  ['cache', 108], ['auth', 109], ['authentication', 110], ['oauth', 111],
  ['jwt', 112], ['security', 113], ['validation', 114], ['testing', 115],
  ['test', 116], ['mock', 117], ['fetch', 118], ['axios', 119],
  ['request', 120], ['client', 121], ['server', 122],
  
  // Data/State
  ['state', 150], ['store', 151], ['redux', 152], ['mobx', 153],
  ['zustand', 154], ['context', 155], ['hook', 156], ['signal', 157],
  ['observable', 158], ['immutable', 159], ['data', 160], ['json', 161],
  ['csv', 162], ['xml', 163], ['yaml', 164], ['parser', 165],
  ['serialize', 166], ['validate', 167], ['schema', 168],
  
  // Utilities
  ['utils', 200], ['lodash', 201], ['underscore', 202], ['ramda', 203],
  ['date', 204], ['time', 205], ['moment', 206], ['dayjs', 207],
  ['format', 208], ['parse', 209], ['string', 210], ['array', 211],
  ['object', 212], ['number', 213], ['math', 214], ['random', 215],
  ['uuid', 216], ['slug', 217], ['url', 218], ['path', 219],
  ['file', 220], ['fs', 221], ['stream', 222], ['buffer', 223],
  ['crypto', 224], ['hash', 225], ['encrypt', 226], ['compress', 227],
  ['zip', 228], ['image', 229], ['resize', 230], ['canvas', 231],
  ['svg', 232], ['color', 233], ['css', 234], ['style', 235],
  ['sass', 236], ['less', 237], ['stylus', 238], ['tailwind', 239],
  ['bootstrap', 240], ['material', 241], ['chakra', 242], ['mantine', 243],
  
  // Performance
  ['performance', 250], ['optimize', 251], ['fast', 252], ['speed', 253],
  ['lazy', 254], ['load', 255], ['cache', 256], ['memoize', 257],
  ['virtual', 258], ['scroll', 259], ['infinite', 260], ['list', 261],
  ['window', 262], ['batch', 263], ['debounce', 264], ['throttle', 265],
  ['async', 266], ['promise', 267], ['await', 268], ['concurrent', 269],
  ['worker', 270], ['thread', 271], ['parallel', 272],
  
  // Animation/Graphics
  ['animation', 300], ['transition', 301], ['motion', 302], ['framer', 303],
  ['gsap', 304], ['anime', 305], ['lottie', 306], ['three', 307],
  ['webgl', 308], ['canvas', 309], ['svg', 310], ['draw', 311],
  ['chart', 312], ['graph', 313], ['plot', 314], ['visualization', 315],
  ['d3', 316], ['chartjs', 317], ['recharts', 318], ['victory', 319],
  
  // Build/Dev
  ['build', 350], ['bundle', 351], ['webpack', 352], ['vite', 353],
  ['rollup', 354], ['esbuild', 355], ['parcel', 356], ['turbopack', 357],
  ['babel', 358], ['typescript', 359], ['ts', 360], ['transpile', 361],
  ['compile', 362], ['minify', 363], ['uglify', 364], ['compress', 365],
  ['lint', 366], ['eslint', 367], ['prettier', 368], ['format', 369],
  ['test', 370], ['jest', 371], ['vitest', 372], ['mocha', 373],
  ['cypress', 374], ['playwright', 375], ['storybook', 376],
  
  // Mobile/Desktop
  ['mobile', 400], ['native', 401], ['react-native', 402], ['ionic', 403],
  ['capacitor', 404], ['electron', 405], ['tauri', 406], ['pwa', 407],
  ['desktop', 408], ['app', 409], ['ios', 410], ['android', 411],
  
  // AI/ML
  ['ai', 450], ['ml', 451], ['machine', 452], ['learning', 453],
  ['model', 454], ['neural', 455], ['tensorflow', 456], ['pytorch', 457],
  ['onnx', 458], ['transformers', 459], ['gpt', 460], ['llm', 461],
  ['embedding', 462], ['vector', 463], ['search', 464], ['similarity', 465],
  ['cluster', 466], ['classify', 467], ['predict', 468], ['nlp', 469],
  ['computer-vision', 470], ['image', 471], ['recognition', 472],
  
  // Description words
  ['simple', 500], ['easy', 501], ['lightweight', 502], ['fast', 503],
  ['modern', 504], ['powerful', 505], ['flexible', 506], ['robust', 507],
  ['scalable', 508], ['reliable', 509], ['efficient', 510], ['clean', 511],
  ['minimal', 512], ['tiny', 513], ['small', 514], ['zero', 515],
  ['dependency', 516], ['framework', 517], ['library', 518], ['tool', 519],
  ['plugin', 520], ['extension', 521], ['module', 522], ['package', 523]
]);

const EMBEDDING_DIM = 128;

/**
 * Generate a vector embedding for text
 * This is a simplified implementation for the spike.
 * In production, use OpenAI, Hugging Face, or similar.
 */
export function generateEmbedding(text) {
  // Normalize text
  const normalized = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(/\s+/);
  
  // Create embedding vector
  const embedding = new Array(EMBEDDING_DIM).fill(0);
  
  for (const word of words) {
    const index = VOCABULARY.get(word);
    if (index !== undefined && index < EMBEDDING_DIM) {
      embedding[index] += 1;
    }
    
    // Also check for partial matches
    for (const [vocabWord, vocabIndex] of VOCABULARY) {
      if (vocabIndex >= EMBEDDING_DIM) continue;
      
      if (word.includes(vocabWord) || vocabWord.includes(word)) {
        embedding[vocabIndex] += 0.5;
      }
    }
  }
  
  // Add some deterministic noise based on text hash for uniqueness
  const hash = createHash('md5').update(text).digest('hex');
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    const hashByte = parseInt(hash.substr(i % 32, 2), 16);
    embedding[i] += (hashByte / 255) * 0.1;
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same dimension');
  }
  
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }
  
  return dotProduct; // Already normalized, so dot product = cosine similarity
}

/**
 * Calculate Euclidean distance between two embeddings
 */
export function euclideanDistance(embedding1, embedding2) {
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Find similar embeddings using cosine similarity
 */
export function findSimilar(queryEmbedding, embeddings, topK = 10) {
  const similarities = embeddings.map((item, index) => ({
    index,
    item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding)
  }));
  
  // Sort by similarity (descending)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, topK);
}

/**
 * Serialize embedding to JSON
 */
export function serializeEmbedding(embedding) {
  return JSON.stringify(embedding);
}

/**
 * Deserialize embedding from JSON
 */
export function deserializeEmbedding(json) {
  return JSON.parse(json);
}

/**
 * Extract keywords from text using the vocabulary
 */
export function extractKeywords(text) {
  const normalized = text.toLowerCase();
  const keywords = [];
  
  for (const [word, index] of VOCABULARY) {
    if (normalized.includes(word)) {
      keywords.push(word);
    }
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

export { EMBEDDING_DIM, VOCABULARY };
