#!/usr/bin/env node
/**
 * Project Modern - Evaluation Service
 * Fastify API with TypeScript 5.8
 */

import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { createHash } from 'crypto';
import type {
  PackagePlatform,
  Tool,
  ToolEvaluationResponse,
  CompositeScore,
  ScoreBreakdown,
  ScoreGrade,
  DataSources,
  LibrariesIoData,
  GitHubData,
  ScorecardData,
} from '@projectmodern/types';

// ============================================================================
// Configuration
// ============================================================================

interface Config {
  port: number;
  githubToken: string | undefined;
  librariesIoApiKey: string | undefined;
  scorecardEnabled: boolean;
  cacheTtl: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  githubToken: process.env.GITHUB_TOKEN,
  librariesIoApiKey: process.env.LIBRARIES_IO_API_KEY,
  scorecardEnabled: false,
  cacheTtl: 60 * 60 * 1000, // 1 hour
};

// ============================================================================
// In-Memory Cache (Redis in production)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(source: string, identifier: string): string {
  return createHash('md5').update(`${source}:${identifier}`).digest('hex');
}

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < config.cacheTtl) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// Data Source Integrations
// ============================================================================

async function getScorecardData(owner: string, repo: string): Promise<ScorecardData> {
  const cacheKey = getCacheKey('scorecard', `${owner}/${repo}`);
  const cached = getCached<ScorecardData>(cacheKey);
  if (cached) return cached;

  // Mock data for now - real implementation would call scorecard CLI
  const data = generateMockScorecardData(owner, repo);
  setCached(cacheKey, data);
  return data;
}

function generateMockScorecardData(owner: string, repo: string): ScorecardData {
  const nameHash = createHash('md5').update(repo).digest('hex');
  const baseScore = (Number.parseInt(nameHash.slice(0, 2), 16) % 40) + 60;

  return {
    score: baseScore / 10,
    checks: [
      { name: 'Code-Review', score: 10, reason: 'PRs are reviewed' },
      { name: 'Maintained', score: Math.floor(baseScore / 10), reason: 'Active development' },
      {
        name: 'Security-Policy',
        score: baseScore > 70 ? 10 : 0,
        reason: baseScore > 70 ? 'policy detected' : 'no policy',
      },
      {
        name: 'Dependency-Update-Tool',
        score: baseScore > 75 ? 10 : 5,
        reason: 'dependabot config',
      },
      { name: 'Binary-Artifacts', score: 10, reason: 'no binaries found' },
      {
        name: 'Branch-Protection',
        score: baseScore > 80 ? 8 : 3,
        reason: baseScore > 80 ? 'protection enabled' : 'not enabled',
      },
      {
        name: 'Signed-Releases',
        score: baseScore > 85 ? 10 : 0,
        reason: baseScore > 85 ? 'releases signed' : 'no signed releases',
      },
      {
        name: 'Token-Permissions',
        score: baseScore > 70 ? 10 : 5,
        reason: 'token permissions',
      },
    ],
    date: new Date(),
    isMock: true,
  };
}

async function getLibrariesIoData(platform: string, name: string): Promise<LibrariesIoData> {
  const cacheKey = getCacheKey('libraries', `${platform}:${name}`);
  const cached = getCached<LibrariesIoData>(cacheKey);
  if (cached) return cached;

  // Mock data for now
  const data = generateMockLibrariesIoData(platform, name);
  setCached(cacheKey, data);
  return data;
}

function generateMockLibrariesIoData(platform: string, name: string): LibrariesIoData {
  const nameHash = createHash('md5').update(name).digest('hex');
  const baseStars = (Number.parseInt(nameHash.slice(0, 4), 16) % 50000) + 1000;

  return {
    name,
    platform,
    description: `A popular ${platform} package for ${name}`,
    keywords: ['javascript', 'framework', name.toLowerCase()],
    stars: baseStars,
    forks: Math.floor(baseStars * 0.15),
    dependentReposCount: Math.floor(baseStars * 10),
    dependentPackagesCount: Math.floor(baseStars * 0.1),
    rank: Math.floor(1000 - baseStars / 100),
    status: 'Active',
    latestReleaseNumber: '1.0.0',
    latestReleasePublishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    isMock: true,
  };
}

async function getGitHubData(owner: string, repo: string): Promise<GitHubData> {
  const cacheKey = getCacheKey('github', `${owner}/${repo}`);
  const cached = getCached<GitHubData>(cacheKey);
  if (cached) return cached;

  // Mock data for now
  const data = generateMockGitHubData(owner, repo);
  setCached(cacheKey, data);
  return data;
}

function generateMockGitHubData(owner: string, repo: string): GitHubData {
  const nameHash = createHash('md5').update(repo).digest('hex');
  const baseStars = (Number.parseInt(nameHash.slice(0, 6), 16) % 100000) + 500;

  return {
    fullName: `${owner}/${repo}`,
    description: `A GitHub repository for ${repo}`,
    htmlUrl: `https://github.com/${owner}/${repo}`,
    stargazersCount: baseStars,
    forksCount: Math.floor(baseStars * 0.2),
    openIssuesCount: Math.floor(baseStars * 0.05),
    watchersCount: baseStars,
    language: 'TypeScript',
    topics: ['javascript', 'framework', repo.toLowerCase()],
    pushedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2019-01-01'),
    updatedAt: new Date(),
    hasWiki: true,
    hasPages: false,
    license: { spdxId: 'MIT', name: 'MIT License' },
    isMock: true,
  };
}

// ============================================================================
// Scoring Logic
// ============================================================================

function calculateMaintenanceScore(data: LibrariesIoData): number {
  if (!data) return 0;

  let score = 5;

  if (data.latestReleasePublishedAt) {
    const daysSince =
      (Date.now() - data.latestReleasePublishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 3;
    else if (daysSince < 30) score += 2;
    else if (daysSince < 90) score += 1;
    else score -= 1;
  }

  if (data.status === 'Active') score += 1.5;

  const deps = data.dependentPackagesCount ?? 0;
  if (deps > 10000) score += 2;
  else if (deps > 1000) score += 1;
  else if (deps > 100) score += 0.5;

  const repos = data.dependentReposCount ?? 0;
  if (repos > 100000) score += 1;

  return Math.min(10, Math.max(0, score));
}

function calculatePopularityScore(data: GitHubData): number {
  if (!data) return 0;

  const stars = data.stargazersCount ?? 0;

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

function calculateEcosystemScore(data: LibrariesIoData): number {
  if (!data) return 0;

  let score = 5;

  const repos = data.dependentReposCount ?? 0;
  if (repos > 1000000) score += 4;
  else if (repos > 100000) score += 3;
  else if (repos > 10000) score += 2;
  else if (repos > 1000) score += 1;

  const pkgs = data.dependentPackagesCount ?? 0;
  if (pkgs > 10000) score += 1.5;
  else if (pkgs > 1000) score += 1;
  else if (pkgs > 100) score += 0.5;

  if (data.keywords && data.keywords.length > 3) score += 0.5;

  return Math.min(10, score);
}

function calculateGrade(score: number): ScoreGrade {
  if (score >= 8) return 'A';
  if (score >= 6) return 'B';
  if (score >= 4) return 'C';
  if (score >= 2) return 'D';
  return 'F';
}

function getRecommendation(score: number): string {
  if (score >= 8) return 'Excellent choice - High quality, well-maintained';
  if (score >= 6) return 'Good choice - Consider alternatives for critical use';
  return 'Use with caution - Review alternatives';
}

function calculateCompositeScore(
  security: number,
  maintenance: number,
  popularity: number,
  ecosystem: number
): CompositeScore {
  const weights = {
    security: 0.3,
    maintenance: 0.25,
    popularity: 0.25,
    ecosystem: 0.2,
  };

  const composite =
    security * weights.security +
    maintenance * weights.maintenance +
    popularity * weights.popularity +
    ecosystem * weights.ecosystem;

  const rounded = Math.round(composite * 10) / 10;

  return {
    overall: rounded,
    grade: calculateGrade(rounded),
    breakdown: {
      security,
      maintenance,
      popularity,
      ecosystem,
    },
    recommendation: getRecommendation(rounded),
    confidence: 0.85,
  };
}

// ============================================================================
// Server Setup
// ============================================================================

async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
    pluginTimeout: 30000,
  });

  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '2.0.0',
    scorecardEnabled: config.scorecardEnabled,
    githubTokenSet: !!config.githubToken,
    librariesIoKeySet: !!config.librariesIoApiKey,
  }));

  // Evaluate tool
  fastify.get<{
    Params: { platform: string; name: string };
    Querystring: { refresh?: string };
  }>('/tools/:platform/:name', async (request, reply) => {
    const { platform, name } = request.params;

    fastify.log.info(`Evaluating ${platform}/${name}`);

    try {
      // Fetch from all sources in parallel
      const [librariesData, githubData] = await Promise.all([
        getLibrariesIoData(platform, name),
        getGitHubData(platform, name),
      ]);

      const scorecardData = await getScorecardData(platform, name);

      // Calculate composite score
      const evaluation = calculateCompositeScore(
        scorecardData.score,
        calculateMaintenanceScore(librariesData),
        calculatePopularityScore(githubData),
        calculateEcosystemScore(librariesData)
      );

      const metadata: Tool['metadata'] = {
        repository: githubData.htmlUrl,
      };
      const license = librariesData.license ?? githubData.license?.spdxId;
      if (license) {
        metadata.license = license;
      }
      if (librariesData.latestReleaseNumber) {
        metadata.version = librariesData.latestReleaseNumber;
      }
      if (librariesData.latestReleasePublishedAt) {
        metadata.lastReleaseDate = librariesData.latestReleasePublishedAt;
      }

      const tool: Tool = {
        id: `${platform}/${name}`,
        name,
        platform: platform as PackagePlatform,
        description: librariesData.description ?? githubData.description ?? '',
        keywords: librariesData.keywords ?? githubData.topics ?? [],
        score: evaluation,
        metadata,
        sources: {
          scorecard: scorecardData,
          librariesIo: librariesData,
          github: githubData,
        },
        createdAt: githubData.createdAt,
        updatedAt: githubData.updatedAt,
      };

      const response: ToolEvaluationResponse = {
        tool,
        cached: false,
        timestamp: new Date(),
      };

      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Compare tools
  fastify.post<{
    Body: { tools: Array<{ platform: string; name: string }> };
  }>('/compare', async (request) => {
    const { tools } = request.body;

    const results = await Promise.all(
      tools.map(async ({ platform, name }) => {
        try {
          const [librariesData, githubData] = await Promise.all([
            getLibrariesIoData(platform, name),
            getGitHubData(platform, name),
          ]);

          const scorecardData = await getScorecardData(platform, name);
          const evaluation = calculateCompositeScore(
            scorecardData.score,
            calculateMaintenanceScore(librariesData),
            calculatePopularityScore(githubData),
            calculateEcosystemScore(librariesData)
          );

          const metadata: Tool['metadata'] = {
            repository: githubData.htmlUrl,
          };
          if (librariesData.license) {
            metadata.license = librariesData.license;
          }

          return {
            id: `${platform}/${name}`,
            name,
            platform: platform as PackagePlatform,
            description: librariesData.description ?? '',
            keywords: librariesData.keywords ?? [],
            score: evaluation,
            metadata,
            sources: {
              scorecard: scorecardData,
              librariesIo: librariesData,
              github: githubData,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Tool;
        } catch (error) {
          return null;
        }
      })
    );

    const validResults = results.filter((r): r is Tool => r !== null);

    // Sort by composite score
    validResults.sort((a, b) => b.score.overall - a.score.overall);

    return {
      results: validResults,
      ranked: validResults.map((r, i) => ({
        rank: i + 1,
        name: r.name,
        platform: r.platform,
        score: r.score.overall,
        grade: r.score.grade,
      })),
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
      { platform: 'npm', name: 'typescript' },
    ];

    return {
      tools: popularTools,
      endpoint: '/tools/:platform/:name',
      example: '/tools/npm/react',
    };
  });

  return fastify;
}

// ============================================================================
// Start Server
// ============================================================================

async function start(): Promise<void> {
  const fastify = await buildServer();

  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`🚀 Evaluation Service running on http://localhost:${config.port}`);
    fastify.log.info('\nQuick test:');
    fastify.log.info(`  curl http://localhost:${config.port}/health`);
    fastify.log.info(`  curl http://localhost:${config.port}/tools/npm/react`);
    fastify.log.info(`  curl http://localhost:${config.port}/tools/popular`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
