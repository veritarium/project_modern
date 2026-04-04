// Project Modern - Shared Types (2026 Edition)

// ============================================================================
// Core Tool Types
// ============================================================================

export type PackagePlatform = 'npm' | 'pypi' | 'maven' | 'go' | 'rust' | 'nuget';

export interface Tool {
  id: string;
  name: string;
  platform: PackagePlatform;
  description: string;
  keywords: string[];
  score: CompositeScore;
  metadata: ToolMetadata;
  sources: DataSources;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolMetadata {
  license?: string;
  homepage?: string;
  repository?: string;
  author?: string;
  version?: string;
  lastReleaseDate?: Date;
}

// ============================================================================
// Scoring Types
// ============================================================================

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CompositeScore {
  overall: number; // 0-10
  grade: ScoreGrade;
  breakdown: ScoreBreakdown;
  recommendation: string;
  confidence: number; // 0-1
}

export interface ScoreBreakdown {
  security: number; // 30% weight - from OpenSSF Scorecard
  maintenance: number; // 25% weight - from Libraries.io
  popularity: number; // 25% weight - from GitHub
  ecosystem: number; // 20% weight - from Libraries.io dependents
}

export interface ScoreWeights {
  security: number;
  maintenance: number;
  popularity: number;
  ecosystem: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  security: 0.3,
  maintenance: 0.25,
  popularity: 0.25,
  ecosystem: 0.2,
};

/**
 * Calculate composite score from breakdown
 */
export function calculateCompositeScore(
  breakdown: ScoreBreakdown,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): CompositeScore {
  const overall =
    breakdown.security * weights.security +
    breakdown.maintenance * weights.maintenance +
    breakdown.popularity * weights.popularity +
    breakdown.ecosystem * weights.ecosystem;

  const grade: ScoreGrade =
    overall >= 8 ? 'A' : overall >= 6 ? 'B' : overall >= 4 ? 'C' : overall >= 2 ? 'D' : 'F';

  const recommendation =
    overall >= 8
      ? 'Excellent choice - High quality, well-maintained'
      : overall >= 6
        ? 'Good choice - Consider alternatives for critical use'
        : 'Use with caution - Review alternatives';

  return {
    overall: Math.round(overall * 10) / 10,
    grade,
    breakdown,
    recommendation,
    confidence: 0.8,
  };
}

// ============================================================================
// Data Source Types
// ============================================================================

export interface DataSources {
  scorecard?: ScorecardData;
  librariesIo?: LibrariesIoData;
  github?: GitHubData;
  npm?: NpmData;
}

export interface ScorecardData {
  score: number;
  checks: ScorecardCheck[];
  date: Date;
  isMock?: boolean;
}

export interface ScorecardCheck {
  name: string;
  score: number;
  reason: string;
  details?: string;
}

export interface LibrariesIoData {
  name: string;
  platform: string;
  description?: string;
  keywords?: string[];
  license?: string;
  stars: number;
  forks: number;
  dependentReposCount: number;
  dependentPackagesCount: number;
  rank?: number;
  status: 'Active' | 'Inactive' | 'Deprecated' | 'Unmaintained';
  latestReleaseNumber?: string;
  latestReleasePublishedAt?: Date;
  isMock?: boolean;
}

export interface GitHubData {
  fullName: string;
  description?: string;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  watchersCount: number;
  language?: string;
  topics: string[];
  pushedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  hasWiki: boolean;
  hasPages: boolean;
  license?: {
    spdxId: string;
    name: string;
  };
  isMock?: boolean;
}

export interface NpmData {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  weeklyDownloads: number;
  maintainers: string[];
  isMock?: boolean;
}

// ============================================================================
// API Types
// ============================================================================

export interface ToolEvaluationRequest {
  platform: PackagePlatform;
  name: string;
  refreshCache?: boolean;
}

export interface ToolEvaluationResponse {
  tool: Tool;
  cached?: boolean;
  timestamp: Date;
}

export interface ComparisonRequest {
  tools: Array<{
    platform: PackagePlatform;
    name: string;
  }>;
}

export interface ComparisonResponse {
  results: Tool[];
  ranked: RankedTool[];
}

export interface RankedTool {
  rank: number;
  name: string;
  platform: PackagePlatform;
  score: number;
  grade: ScoreGrade;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  category?: string;
  minScore?: number;
}

export interface SearchResponse {
  query: string;
  category?: string;
  resultsCount: number;
  duration: string;
  results: SearchResult[];
}

export interface SearchResult {
  name: string;
  platform: PackagePlatform;
  description: string;
  score: number;
  similarity: number;
  combinedScore: number;
  keywordMatches?: number;
}

// ============================================================================
// Semantic Search Types
// ============================================================================

export interface ToolWithEmbedding extends Tool {
  embedding: number[];
}

export interface SemanticSearchResult {
  tool: Tool;
  similarity: number;
}

export interface QueryLog {
  id: string;
  query: string;
  embedding?: number[];
  resultsCount: number;
  timestamp: Date;
  userId?: string;
  duration?: number;
}

// ============================================================================
// Audit Types
// ============================================================================

export interface ProjectAuditRequest {
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ProjectAuditResponse {
  projectScore: number;
  totalDependencies: number;
  evaluatedDependencies: number;
  gradeDistribution: Record<ScoreGrade, number>;
  packages: AuditedPackage[];
  issues: PackageIssue[];
  topPackages: AuditedPackage[];
}

export interface AuditedPackage {
  name: string;
  version: string;
  score: number;
  grade: ScoreGrade;
  recommendation: string;
  breakdown: ScoreBreakdown;
}

export interface PackageIssue {
  package: string;
  version: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

// ============================================================================
// Enterprise Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  teamId?: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  settings: TeamSettings;
  createdAt: Date;
}

export interface TeamSettings {
  defaultPolicySetId?: string;
  notificationsEnabled: boolean;
  slackWebhookUrl?: string;
  githubOrg?: string;
}

export type PolicyType =
  | 'minScore'
  | 'blocked'
  | 'allowed'
  | 'license'
  | 'maintenance'
  | 'security';

export interface Policy {
  id: string;
  teamId?: string;
  name: string;
  type: PolicyType;
  config: PolicyConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PolicyConfig =
  | { value: number } // minScore, maintenance
  | { packages: string[] } // blocked, allowed
  | { licenses: string[]; mode: 'allow' | 'deny' } // license
  | { checks: string[] }; // security

export interface PolicyViolation {
  policy: Policy;
  message: string;
  severity: 'error' | 'warning';
  tool?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  teamId?: string;
  action: AuditAction;
  resource: {
    type: string;
    id: string;
  };
  metadata: Record<string, unknown>;
  ipAddress?: string;
}

export type AuditAction =
  | 'tool_evaluated'
  | 'tool_searched'
  | 'comparison_created'
  | 'project_audited'
  | 'policy_violated'
  | 'policy_created'
  | 'policy_updated'
  | 'report_generated'
  | 'user_logged_in'
  | 'api_key_created';

// ============================================================================
// CLI Types
// ============================================================================

export interface CLIOptions {
  platform?: PackagePlatform;
  path?: string;
  output?: string;
  report?: boolean;
  format?: 'table' | 'json' | 'markdown';
  minScore?: number;
  failOnUnmaintained?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class ProjectModernError extends Error {
  code: string;
  statusCode: number;
  details: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProjectModernError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details ?? undefined;
  }
}

export type ErrorCode =
  | 'TOOL_NOT_FOUND'
  | 'PLATFORM_NOT_SUPPORTED'
  | 'API_RATE_LIMIT'
  | 'CACHE_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'POLICY_VIOLATION'
  | 'INTERNAL_ERROR';

// ============================================================================
// Health & Status
// ============================================================================

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  services: Record<string, ServiceHealth>;
}

export interface ServiceHealth {
  status: 'ok' | 'error';
  latency?: number;
  message?: string;
}
