/**
 * Seed the semantic search database with sample tools
 */

import { initDatabase, upsertTool, closeDatabase } from './database.js';
import { generateEmbedding } from './embeddings.js';

const sampleTools = [
  {
    name: 'react',
    platform: 'npm',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces',
    keywords: ['react', 'ui', 'component', 'frontend', 'framework', 'javascript', 'virtual-dom'],
    score: 8.5
  },
  {
    name: 'vue',
    platform: 'npm',
    description: 'The Progressive JavaScript Framework. Approachable, versatile, and performant.',
    keywords: ['vue', 'ui', 'component', 'frontend', 'framework', 'javascript', 'progressive'],
    score: 8.3
  },
  {
    name: 'angular',
    platform: 'npm',
    description: 'The modern web developer\'s platform. Complete framework for building mobile and desktop web applications.',
    keywords: ['angular', 'ui', 'component', 'frontend', 'framework', 'typescript', 'google'],
    score: 7.8
  },
  {
    name: 'svelte',
    platform: 'npm',
    description: 'Cybernetically enhanced web apps. Compiler-based framework with no virtual DOM.',
    keywords: ['svelte', 'ui', 'component', 'frontend', 'framework', 'javascript', 'compiler'],
    score: 8.1
  },
  {
    name: 'lodash',
    platform: 'npm',
    description: 'A modern JavaScript utility library delivering modularity, performance, and extras.',
    keywords: ['lodash', 'utils', 'utility', 'array', 'object', 'string', 'function', 'javascript'],
    score: 8.2
  },
  {
    name: 'axios',
    platform: 'npm',
    description: 'Promise based HTTP client for the browser and node.js. Makes HTTP requests easy.',
    keywords: ['axios', 'http', 'client', 'api', 'request', 'promise', 'fetch', 'ajax'],
    score: 8.0
  },
  {
    name: 'express',
    platform: 'npm',
    description: 'Fast, unopinionated, minimalist web framework for Node.js. Build web applications and APIs.',
    keywords: ['express', 'http', 'server', 'framework', 'nodejs', 'api', 'rest', 'web'],
    score: 8.4
  },
  {
    name: 'fastify',
    platform: 'npm',
    description: 'Fast and low overhead web framework, for Node.js. Highly performant with built-in validation.',
    keywords: ['fastify', 'http', 'server', 'framework', 'nodejs', 'api', 'fast', 'performance'],
    score: 8.3
  },
  {
    name: 'redux',
    platform: 'npm',
    description: 'Predictable state container for JavaScript apps. Centralized state management.',
    keywords: ['redux', 'state', 'store', 'management', 'javascript', 'flux', 'react'],
    score: 7.9
  },
  {
    name: 'zustand',
    platform: 'npm',
    description: 'A small, fast and scalable bearbones state-management solution. Minimal API.',
    keywords: ['zustand', 'state', 'store', 'management', 'react', 'minimal', 'lightweight'],
    score: 8.2
  },
  {
    name: 'jest',
    platform: 'npm',
    description: 'Delightful JavaScript Testing. Zero configuration testing platform.',
    keywords: ['jest', 'test', 'testing', 'javascript', 'unit', 'mock', 'snapshot', 'facebook'],
    score: 8.3
  },
  {
    name: 'vitest',
    platform: 'npm',
    description: 'A blazing fast unit test framework powered by Vite. Next generation testing.',
    keywords: ['vitest', 'test', 'testing', 'javascript', 'vite', 'fast', 'unit', 'modern'],
    score: 8.4
  },
  {
    name: 'tailwindcss',
    platform: 'npm',
    description: 'A utility-first CSS framework for rapidly building custom designs. Low-level CSS.',
    keywords: ['tailwind', 'css', 'style', 'framework', 'utility', 'design', 'responsive'],
    score: 8.5
  },
  {
    name: 'bootstrap',
    platform: 'npm',
    description: 'The most popular HTML, CSS, and JavaScript framework for developing responsive projects.',
    keywords: ['bootstrap', 'css', 'style', 'framework', 'ui', 'component', 'responsive', 'twitter'],
    score: 7.5
  },
  {
    name: 'material-ui',
    platform: 'npm',
    description: 'MUI Core: Ready-to-use foundational React components. Implement Google\'s Material Design.',
    keywords: ['material', 'ui', 'component', 'react', 'google', 'design', 'css', 'framework'],
    score: 8.1
  },
  {
    name: 'framer-motion',
    platform: 'npm',
    description: 'A production-ready motion library for React. Declarative animations and gestures.',
    keywords: ['framer', 'motion', 'animation', 'react', 'gesture', 'transition', 'ui'],
    score: 8.3
  },
  {
    name: 'gsap',
    platform: 'npm',
    description: 'Professional-grade JavaScript animation for the modern web. GreenSock Animation Platform.',
    keywords: ['gsap', 'animation', 'javascript', 'green', 'sock', 'timeline', 'tween'],
    score: 8.4
  },
  {
    name: 'recharts',
    platform: 'npm',
    description: 'Redefined chart library built with React and D3. Composable React components for charts.',
    keywords: ['recharts', 'chart', 'graph', 'visualization', 'react', 'd3', 'data', 'svg'],
    score: 7.9
  },
  {
    name: 'd3',
    platform: 'npm',
    description: 'Data-Driven Documents. JavaScript library for producing dynamic, interactive data visualizations.',
    keywords: ['d3', 'chart', 'graph', 'visualization', 'data', 'svg', 'canvas', 'javascript'],
    score: 8.1
  },
  {
    name: 'dayjs',
    platform: 'npm',
    description: '2kB JavaScript date utility library. Immutable date library alternative to Moment.js.',
    keywords: ['dayjs', 'date', 'time', 'moment', 'parse', 'format', 'lightweight', 'javascript'],
    score: 8.2
  },
  {
    name: 'date-fns',
    platform: 'npm',
    description: 'Modern JavaScript date utility library. Modular, functional, works with webpack and Browserify.',
    keywords: ['date-fns', 'date', 'time', 'parse', 'format', 'functional', 'javascript'],
    score: 8.3
  },
  {
    name: 'uuid',
    platform: 'npm',
    description: 'RFC4122 UUIDs. Generate RFC-compliant UUIDs in JavaScript.',
    keywords: ['uuid', 'guid', 'id', 'unique', 'identifier', 'random', 'rfc4122'],
    score: 7.8
  },
  {
    name: 'bcrypt',
    platform: 'npm',
    description: 'A library to help you hash passwords. Blowfish cipher with slow hashing for security.',
    keywords: ['bcrypt', 'hash', 'password', 'security', 'crypto', 'encryption', 'auth'],
    score: 7.9
  },
  {
    name: 'jsonwebtoken',
    platform: 'npm',
    description: 'JSON Web Token implementation. Generate and verify JWTs for authentication.',
    keywords: ['jwt', 'token', 'auth', 'authentication', 'json', 'web', 'security'],
    score: 7.8
  },
  {
    name: 'cors',
    platform: 'npm',
    description: 'Node.js CORS middleware. Enable Cross-Origin Resource Sharing in Express/Connect.',
    keywords: ['cors', 'middleware', 'http', 'cross-origin', 'express', 'server', 'security'],
    score: 7.6
  },
  {
    name: 'helmet',
    platform: 'npm',
    description: 'Help secure Express apps with various HTTP headers. Security middleware collection.',
    keywords: ['helmet', 'security', 'http', 'headers', 'express', 'middleware', 'xss', 'csp'],
    score: 8.1
  },
  {
    name: 'compression',
    platform: 'npm',
    description: 'Node.js compression middleware. Gzip/deflate compression for HTTP responses.',
    keywords: ['compression', 'gzip', 'deflate', 'middleware', 'express', 'performance', 'http'],
    score: 7.5
  },
  {
    name: 'morgan',
    platform: 'npm',
    description: 'HTTP request logger middleware for node.js. Log HTTP requests in various formats.',
    keywords: ['morgan', 'logger', 'logging', 'http', 'middleware', 'express', 'request'],
    score: 7.4
  },
  {
    name: 'dotenv',
    platform: 'npm',
    description: 'Loads environment variables from .env file. Zero-dependency module.',
    keywords: ['dotenv', 'env', 'environment', 'config', 'variable', 'file', 'zero-dependency'],
    score: 8.2
  },
  {
    name: 'nodemon',
    platform: 'npm',
    description: 'Simple monitor script for use during development of a Node.js app. Auto-restart on changes.',
    keywords: ['nodemon', 'monitor', 'development', 'dev', 'auto-restart', 'watch', 'node'],
    score: 8.0
  },
  {
    name: 'rimraf',
    platform: 'npm',
    description: 'The UNIX command rm -rf for node. Deep deletion of files and directories.',
    keywords: ['rimraf', 'delete', 'remove', 'file', 'directory', 'clean', 'unix'],
    score: 7.5
  },
  {
    name: 'cross-env',
    platform: 'npm',
    description: 'Cross-platform setting of environment scripts. Set env vars across Windows and Unix.',
    keywords: ['cross-env', 'environment', 'cross-platform', 'windows', 'unix', 'script'],
    score: 7.6
  },
  {
    name: 'concurrently',
    platform: 'npm',
    description: 'Run multiple commands concurrently. Run npm scripts in parallel.',
    keywords: ['concurrently', 'parallel', 'concurrent', 'script', 'npm', 'command', 'run'],
    score: 7.7
  },
  {
    name: 'chalk',
    platform: 'npm',
    description: 'Terminal string styling done right. Style strings with colors and formatting.',
    keywords: ['chalk', 'color', 'terminal', 'cli', 'style', 'ansi', 'string', 'format'],
    score: 8.1
  },
  {
    name: 'commander',
    platform: 'npm',
    description: 'The complete solution for node.js command-line programs. CLI framework.',
    keywords: ['commander', 'cli', 'command', 'argument', 'option', 'parser', 'terminal'],
    score: 8.2
  },
  {
    name: 'inquirer',
    platform: 'npm',
    description: 'A collection of common interactive command line user interfaces. Interactive prompts.',
    keywords: ['inquirer', 'cli', 'interactive', 'prompt', 'question', 'input', 'terminal'],
    score: 7.9
  },
  {
    name: 'ora',
    platform: 'npm',
    description: 'Elegant terminal spinner. Show loading spinners in the terminal.',
    keywords: ['ora', 'spinner', 'loading', 'cli', 'terminal', 'progress', 'indicator'],
    score: 7.8
  },
  {
    name: 'listr2',
    platform: 'npm',
    description: 'Terminal task list. Create beautiful CLI task lists with progress indicators.',
    keywords: ['listr', 'task', 'list', 'cli', 'terminal', 'progress', 'step', 'workflow'],
    score: 7.9
  },
  {
    name: 'node-fetch',
    platform: 'npm',
    description: 'A light-weight module that brings Fetch API to Node.js. Window.fetch compatible.',
    keywords: ['fetch', 'http', 'request', 'node', 'browser', 'api', 'promise', 'lightweight'],
    score: 7.8
  },
  {
    name: 'got',
    platform: 'npm',
    description: 'Human-friendly and powerful HTTP request library for Node.js. Simplified HTTP requests.',
    keywords: ['got', 'http', 'request', 'node', 'human-friendly', 'promise', 'stream'],
    score: 8.0
  },
  {
    name: 'superagent',
    platform: 'npm',
    description: 'Ajax for Node.js and browsers. Client-side HTTP request library.',
    keywords: ['superagent', 'http', 'request', 'ajax', 'client', 'browser', 'node'],
    score: 7.6
  },
  {
    name: 'socket.io',
    platform: 'npm',
    description: 'Realtime application framework. Enables real-time bidirectional event-based communication.',
    keywords: ['socket', 'websocket', 'realtime', 'event', 'io', 'server', 'client'],
    score: 7.9
  },
  {
    name: 'ws',
    platform: 'npm',
    description: 'Simple to use, blazing fast and thoroughly tested WebSocket client and server for Node.js.',
    keywords: ['ws', 'websocket', 'realtime', 'server', 'client', 'fast', 'node'],
    score: 8.1
  },
  {
    name: 'graphql',
    platform: 'npm',
    description: 'A query language for your API. Query exactly what you need, get predictable results.',
    keywords: ['graphql', 'api', 'query', 'facebook', 'schema', 'type', 'language'],
    score: 8.2
  },
  {
    name: 'apollo-server',
    platform: 'npm',
    description: 'Spec-compliant and production ready JavaScript GraphQL server. GraphQL server for Node.js.',
    keywords: ['apollo', 'graphql', 'server', 'api', 'schema', 'javascript', 'node'],
    score: 7.9
  },
  {
    name: 'prisma',
    platform: 'npm',
    description: 'Next-generation ORM for Node.js and TypeScript. Type-safe database client.',
    keywords: ['prisma', 'orm', 'database', 'sql', 'typescript', 'type-safe', 'client'],
    score: 8.3
  },
  {
    name: 'typeorm',
    platform: 'npm',
    description: 'ORM for TypeScript and JavaScript. Supports multiple databases.',
    keywords: ['typeorm', 'orm', 'database', 'typescript', 'javascript', 'sql', 'entity'],
    score: 7.7
  },
  {
    name: 'sequelize',
    platform: 'npm',
    description: 'Feature-rich ORM for modern Node.js. Multi-dialect SQL ORM.',
    keywords: ['sequelize', 'orm', 'database', 'sql', 'node', 'model', 'query'],
    score: 7.5
  },
  {
    name: 'mongoose',
    platform: 'npm',
    description: 'MongoDB object modeling for Node.js. Elegant MongoDB object modeling.',
    keywords: ['mongoose', 'mongodb', 'database', 'mongo', 'schema', 'model', 'node'],
    score: 7.8
  },
  {
    name: 'redis',
    platform: 'npm',
    description: 'Redis client for Node.js. High performance Redis client with async/await support.',
    keywords: ['redis', 'cache', 'database', 'memory', 'key-value', 'node', 'client'],
    score: 7.9
  },
  {
    name: 'ioredis',
    platform: 'npm',
    description: 'A robust, performance-focused and full-featured Redis client for Node and io.js.',
    keywords: ['ioredis', 'redis', 'cache', 'database', 'cluster', 'sentinel', 'performance'],
    score: 8.0
  },
  {
    name: 'sharp',
    platform: 'npm',
    description: 'High performance Node.js image processing. Resize, convert, and manipulate images.',
    keywords: ['sharp', 'image', 'resize', 'convert', 'jpeg', 'png', 'webp', 'performance'],
    score: 8.2
  },
  {
    name: 'jimp',
    platform: 'npm',
    description: 'An image processing library written entirely in JavaScript for Node. Zero native dependencies.',
    keywords: ['jimp', 'image', 'pure', 'javascript', 'zero-dependency', 'resize', 'filter'],
    score: 7.5
  },
  {
    name: 'multer',
    platform: 'npm',
    description: 'Node.js middleware for handling multipart/form-data. Upload files in Express.',
    keywords: ['multer', 'upload', 'file', 'form', 'middleware', 'express', 'multipart'],
    score: 7.6
  },
  {
    name: 'sharp',
    platform: 'npm',
    description: 'High performance Node.js image processing',
    keywords: ['sharp', 'image', 'processing', 'resize', 'convert'],
    score: 8.2
  },
  {
    name: 'pdf-lib',
    platform: 'npm',
    description: 'Create and modify PDF documents in any JavaScript environment.',
    keywords: ['pdf', 'document', 'create', 'modify', 'javascript'],
    score: 7.8
  },
  {
    name: 'puppeteer',
    platform: 'npm',
    description: 'Headless Chrome Node.js API. Control Chrome or Chromium programmatically.',
    keywords: ['puppeteer', 'chrome', 'headless', 'browser', 'automation', 'scraping'],
    score: 8.3
  },
  {
    name: 'playwright',
    platform: 'npm',
    description: 'Cross-browser automation library. Reliable end-to-end testing for modern web apps.',
    keywords: ['playwright', 'browser', 'automation', 'testing', 'e2e', 'chromium', 'firefox', 'webkit'],
    score: 8.4
  },
  {
    name: 'cypress',
    platform: 'npm',
    description: 'Fast, easy and reliable testing for anything that runs in a browser. End-to-end testing.',
    keywords: ['cypress', 'testing', 'e2e', 'browser', 'automation', 'integration'],
    score: 8.2
  },
  {
    name: 'storybook',
    platform: 'npm',
    description: 'Frontend workshop for building UI components and pages in isolation.',
    keywords: ['storybook', 'component', 'ui', 'documentation', 'isolation', 'frontend'],
    score: 8.1
  }
];

async function seed() {
  console.log('🌱 Seeding semantic search database...\n');
  
  await initDatabase();
  
  let success = 0;
  let failed = 0;
  
  for (const tool of sampleTools) {
    try {
      const textToEmbed = `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`;
      const embedding = generateEmbedding(textToEmbed);
      
      await upsertTool({
        ...tool,
        embedding
      });
      
      success++;
      console.log(`  ✅ ${tool.name}`);
    } catch (error) {
      failed++;
      console.log(`  ❌ ${tool.name}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Seeded ${success} tools`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  
  await closeDatabase();
  console.log('\n🎉 Done!');
}

seed().catch(console.error);
