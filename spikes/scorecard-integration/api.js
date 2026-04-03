#!/usr/bin/env node
/**
 * Project Modern - Phase 0: Core API
 * 
 * A Fastify API that integrates:
 * - OpenSSF Scorecard (security scoring)
 * - Libraries.io (package metadata)
 * - GitHub API (activity metrics)
 * 
 * And provides our unique combined scoring.
 */

import Fastify from 'fastify';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const fastify = Fastify({
  logger: true,
  pluginTimeout: 30000
});

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  port: process.env.PORT || 3000,
  githubToken: process.env.GITHUB_TOKEN,
  librariesIoApiKey: process.env.LIBRARIES_IO_API_KEY,
  cacheTtl: 60 * 60 * 1000, // 1 hour
  scorecardEnabled: false // Will be detected
};

// In-memory cache (use Redis in production)
const cache = new Map();

// ============================================================================
// CACHE UTILITIES
// ============================================================================

function getCacheKey(source, identifier) {
  return createHash('md5').update(`${source}:${identifier}`).digest('hex');
}

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG.cacheTtl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// DATA SOURCES
// ============================================================================

/**
 * OpenSSF Scorecard Integration
 */
async function getScorecardData(owner, repo) {
  const cacheKey = getCacheKey('scorecard', `${owner}/${repo}`);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Check if scorecard CLI is available
  if (!CONFIG.scorecardEnabled) {
    return getMockScorecardData(owner, repo);
  }

  try {
    const output = execSync(
      `scorecard --repo=github.com/${owner}/${repo} --format=json`,
      { encoding: 'utf-8', timeout: 60000 }
    );
    const data = JSON.parse(output);
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    fastify.log.warn(`Scorecard failed for ${owner}/${repo}: ${error.message}`);
    return getMockScorecardData(owner, repo);
  }
}

function getMockScorecardData(owner, repo) {
  // Deterministic mock based on repo name
  const nameHash = createHash('md5').update(repo).digest('hex');
  const baseScore = (parseInt(nameHash.slice(0, 2), 16) % 40) + 60; // 60-100
  
  return {
    repo: `${owner}/${repo}`,
    score: baseScore / 10,
    checks: [
      { name: "Code-Review", score: 10, reason: "PRs are reviewed" },
      { name: "Maintained", score: Math.floor(baseScore / 10), reason: "Active development" },
      { name: "Security-Policy", score: baseScore > 70 ? 10 : 0, reason: baseScore > 70 ? "policy detected" : "no policy" },
      { name: "Dependency-Update-Tool", score: baseScore > 75 ? 10 : 5, reason: "dependabot config" },
      { name: "Binary-Artifacts", score: 10, reason: "no binaries found" },
      { name: "Branch-Protection", score: baseScore > 80 ? 8 : 3, reason: baseScore > 80 ? "protection enabled" : "not enabled" },
      { name: "Signed-Releases", score: baseScore > 85 ? 10 : 0, reason: baseScore > 85 ? "releases signed" : "no signed releases" },
      { name: "Token-Permissions", score: baseScore > 70 ? 10 : 5, reason: "token permissions" }
    ],
    _mock: true
  };
}

/**
 * Libraries.io Integration
 */
async function getLibrariesIoData(platform, name) {
  const cacheKey = getCacheKey('libraries', `${platform}:${name}`);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = CONFIG.librariesIoApiKey ? `?api_key=${CONFIG.librariesIoApiKey}` : '';
    const response = await fetch(
      `https://libraries.io/api/${platform}/${name}${apiKey}`,
      { timeout: 10000 }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    fastify.log.warn(`Libraries.io failed for ${name}: ${error.message}`);
    return getMockLibrariesIoData(platform, name);
  }
}

function getMockLibrariesIoData(platform, name) {
  const nameHash = createHash('md5').update(name).digest('hex');
  const baseStars = (parseInt(nameHash.slice(0, 4), 16) % 50000) + 1000;
  
  return {
    name: name,
    platform: platform,
    description: `A popular ${platform} package for ${name}`,
    keywords: ["javascript", "framework", name.toLowerCase()],
    homepage: `https://github.com/example/${name}`,
    repository_url: `https://github.com/example/${name}`,
    normalized_licenses: ["MIT"],
    latest_release_number: "1.0.0",
    latest_release_published_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    stars: baseStars,
    forks: Math.floor(baseStars * 0.15),
    dependent_repos_count: Math.floor(baseStars * 10),
    dependent_packages_count: Math.floor(baseStars * 0.1),
    rank: Math.floor(1000 - (baseStars / 100)),
    status: "Active",
    _mock: true
  };
}

/**
 * GitHub API Integration
 */
async function getGitHubData(owner, repo) {
  const cacheKey = getCacheKey('github', `${owner}/${repo}`);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Project-Modern-API'
    };
    
    if (CONFIG.githubToken) {
      headers.Authorization = `token ${CONFIG.githubToken}`;
    }
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers, timeout: 10000 }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    fastify.log.warn(`GitHub API failed for ${owner}/${repo}: ${error.message}`);
    return getMockGitHubData(owner, repo);
  }
}

function getMockGitHubData(owner, repo) {
  const nameHash = createHash('md5').update(repo).digest('hex');
  const baseStars = (parseInt(nameHash.slice(0, 6), 16) % 100000) + 500;
  
  return {
    full_name: `${owner}/${repo}`,
    description: `A GitHub repository for ${repo}`,
    html_url: `https://github.com/${owner}/${repo}`,
    stargazers_count: baseStars,
    forks_count: Math.floor(baseStars * 0.2),
    open_issues_count: Math.floor(baseStars * 0.05),
    watchers_count: baseStars,
    language: "TypeScript",
    topics: ["javascript", "framework", repo.toLowerCase()],
    pushed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: "2019-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    has_wiki: true,
    has_pages: false,
    license: { spdx_id: "MIT", name: "MIT License" },
    _mock: true
  };
}

// ============================================================================
// OUR UNIQUE LAYER: Combined Scoring
// ============================================================================

function calculateMaintenanceScore(librariesData) {
  if (!librariesData) return 0;
  
  let score = 5;
  
  // Recent release bonus
  if (librariesData.latest_release_published_at) {
    const daysSince = (Date.now() - new Date(librariesData.latest_release_published_at)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 3;
    else if (daysSince < 30) score += 2;
    else if (daysSince < 90) score += 1;
    else score -= 1;
  }
  
  // Active status
  if (librariesData.status === "Active") score += 1.5;
  
  // Has dependents
  const deps = librariesData.dependent_packages_count || 0;
  if (deps > 10000) score += 2;
  else if (deps > 1000) score += 1;
  else if (deps > 100) score += 0.5;
  
  // Large ecosystem
  const repos = librariesData.dependent_repos_count || 0;
  if (repos > 100000) score += 1;
  
  return Math.min(10, Math.max(0, score));
}

function calculatePopularityScore(githubData) {
  if (!githubData) return 0;
  
  const stars = githubData.stargazers_count || 0;
  
  // Logarithmic scale for popularity
  if (stars >= 100000) return 10;
  if (stars >= 50000) return 9.5;
  if (stars >= 20000) return 9;
  if (stars >= 10000) return 8;
  if (stars >= 5000) return 7;
  if (stars >= 2000) return 6;
  if (stars >= 1000) return 5;
  if (stars >= 500) return 4;
  if (stars >= 200) return 3;
  if (stars >= 50) return 2;
  return 1;
}

function calculateEcosystemScore(librariesData) {
  if (!librariesData) return 0;
  
  let score = 5;
  
  // Dependent repos
  const repos = librariesData.dependent_repos_count || 0;
  if (repos > 1000000) score += 4;
  else if (repos > 100000) score += 3;
  else if (repos > 10000) score += 2;
  else if (repos > 1000) score += 1;
  
  // Dependent packages
  const pkgs = librariesData.dependent_packages_count || 0;
  if (pkgs > 10000) score += 1.5;
  else if (pkgs > 1000) score += 1;
  else if (pkgs > 100) score += 0.5;
  
  // Keywords indicate discoverability
  if (librariesData.keywords && librariesData.keywords.length > 3) score += 0.5;
  
  return Math.min(10, score);
}

function calculateProjectModernScore(scorecardData, librariesData, githubData) {
  const scores = {
    security: scorecardData?.score || 0,
    maintenance: calculateMaintenanceScore(librariesData),
    popularity: calculatePopularityScore(githubData),
    ecosystem: calculateEcosystemScore(librariesData)
  };
  
  // Weighted composite (our unique formula)
  const composite = (
    scores.security * 0.30 +
    scores.maintenance * 0.25 +
    scores.popularity * 0.25 +
    scores.ecosystem * 0.20
  );
  
  return {
    composite: Math.round(composite * 10) / 10,
    breakdown: scores,
    grade: composite >= 8 ? 'A' : composite >= 6 ? 'B' : composite >= 4 ? 'C' : 'D',
    recommendation: composite >= 8 
      ? 'Excellent choice - High quality, well-maintained' 
      : composite >= 6 
        ? 'Good choice - Consider alternatives for critical use'
        : 'Use with caution - Review alternatives'
  };
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    scorecardEnabled: CONFIG.scorecardEnabled,
    githubTokenSet: !!CONFIG.githubToken,
    librariesIoKeySet: !!CONFIG.librariesIoApiKey
  };
});

// Get tool evaluation
fastify.get('/tools/:platform/:name', async (request, reply) => {
  const { platform, name } = request.params;
  
  fastify.log.info(`Evaluating ${platform}/${name}`);
  
  try {
    // Fetch from all sources in parallel
    const [librariesData, githubData] = await Promise.all([
      getLibrariesIoData(platform, name),
      getGitHubData(platform, name) // Using platform as owner for demo
    ]);
    
    // Get owner/repo from libraries data or use platform/name
    const owner = platform;
    const repo = name;
    
    const scorecardData = await getScorecardData(owner, repo);
    
    // Calculate our combined score
    const evaluation = calculateProjectModernScore(scorecardData, librariesData, githubData);
    
    return {
      name,
      platform,
      evaluation,
      sources: {
        scorecard: {
          score: scorecardData.score,
          checks: scorecardData.checks?.slice(0, 5),
          isMock: !!scorecardData._mock
        },
        libraries: {
          stars: librariesData.stars,
          forks: librariesData.forks,
          dependents: librariesData.dependent_packages_count,
          repos: librariesData.dependent_repos_count,
          rank: librariesData.rank,
          status: librariesData.status,
          isMock: !!librariesData._mock
        },
        github: {
          stars: githubData.stargazers_count,
          forks: githubData.forks_count,
          issues: githubData.open_issues_count,
          language: githubData.language,
          pushed: githubData.pushed_at,
          isMock: !!githubData._mock
        }
      },
      metadata: {
        description: librariesData.description || githubData.description,
        license: librariesData.normalized_licenses?.[0] || githubData.license?.spdx_id,
        homepage: librariesData.homepage,
        repository: librariesData.repository_url || githubData.html_url,
        keywords: librariesData.keywords || githubData.topics
      }
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500);
    return { error: error.message };
  }
});

// Compare multiple tools
fastify.post('/compare', async (request) => {
  const { tools } = request.body; // [{ platform, name }]
  
  const results = await Promise.all(
    tools.map(async ({ platform, name }) => {
      try {
        const [librariesData, githubData] = await Promise.all([
          getLibrariesIoData(platform, name),
          getGitHubData(platform, name)
        ]);
        
        const scorecardData = await getScorecardData(platform, name);
        const evaluation = calculateProjectModernScore(scorecardData, librariesData, githubData);
        
        return {
          name: `${platform}/${name}`,
          evaluation,
          metadata: {
            description: librariesData.description,
            stars: githubData.stargazers_count
          }
        };
      } catch (error) {
        return { name: `${platform}/${name}`, error: error.message };
      }
    })
  );
  
  // Sort by composite score
  results.sort((a, b) => (b.evaluation?.composite || 0) - (a.evaluation?.composite || 0));
  
  return {
    results,
    ranked: results.map((r, i) => ({ 
      rank: i + 1, 
      name: r.name, 
      score: r.evaluation?.composite || 0 
    }))
  };
});

// Search tools (basic implementation)
fastify.get('/search', async (request) => {
  const { q, category, minScore = 0 } = request.query;
  
  // In real implementation, this would search Libraries.io or our index
  // For now, return a helpful message
  return {
    query: q,
    message: "Search requires a search index (Meilisearch/Algolia)",
    suggestion: "Use /tools/:platform/:name to evaluate specific packages",
    example: `/tools/npm/react`
  };
});

// List popular tools
fastify.get('/tools/popular', async () => {
  const popularTools = [
    { platform: 'npm', name: 'react' },
    { platform: 'npm', name: 'vue' },
    { platform: 'npm', name: 'svelte' },
    { platform: 'npm', name: 'angular' },
    { platform: 'npm', name: 'lodash' },
    { platform: 'npm', name: 'express' },
    { platform: 'npm', name: 'next' },
    { platform: 'npm', name: 'typescript' }
  ];
  
  return {
    tools: popularTools,
    endpoint: "/tools/:platform/:name",
    example: "/tools/npm/react"
  };
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  // Check if scorecard is available
  try {
    execSync('scorecard version', { stdio: 'pipe' });
    CONFIG.scorecardEnabled = true;
    fastify.log.info('✅ OpenSSF Scorecard CLI detected');
  } catch {
    fastify.log.warn('⚠️  OpenSSF Scorecard CLI not found - using mock data');
    fastify.log.info('   Install: https://github.com/ossf/scorecard#installation');
  }
  
  // Log configuration
  fastify.log.info('Configuration:');
  fastify.log.info(`  Scorecard: ${CONFIG.scorecardEnabled ? 'enabled' : 'mock data'}`);
  fastify.log.info(`  GitHub Token: ${CONFIG.githubToken ? 'set' : 'not set (rate limited)'}`);
  fastify.log.info(`  Libraries.io API Key: ${CONFIG.librariesIoApiKey ? 'set' : 'not set (rate limited)'}`);
  
  try {
    await fastify.listen({ port: CONFIG.port, host: '0.0.0.0' });
    fastify.log.info(`\n🚀 Project Modern API running on http://localhost:${CONFIG.port}`);
    fastify.log.info('\nQuick test:');
    fastify.log.info(`  curl http://localhost:${CONFIG.port}/health`);
    fastify.log.info(`  curl http://localhost:${CONFIG.port}/tools/npm/react`);
    fastify.log.info(`  curl http://localhost:${CONFIG.port}/tools/popular`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
