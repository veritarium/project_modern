// Project Modern - API Client (2026 Edition)

import type {
  PackagePlatform,
  Tool,
  ToolEvaluationResponse,
  ComparisonRequest,
  ComparisonResponse,
  SearchRequest,
  SearchResponse,
  ProjectAuditResponse,
  HealthStatus,
  ProjectModernError,
} from '@projectmodern/types';

export interface ClientConfig {
  baseUrl: string;
  apiKey: string | undefined;
  timeout: number | undefined;
  retries: number | undefined;
}

export class ProjectModernClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private timeout: number;
  private retries: number;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey ?? undefined;
    this.timeout = config.timeout ?? 30000;
    this.retries = config.retries ?? 3;
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async health(): Promise<HealthStatus> {
    return this.fetch<HealthStatus>('/health');
  }

  // ============================================================================
  // Tool Evaluation
  // ============================================================================

  async evaluateTool(
    platform: PackagePlatform,
    name: string,
    refreshCache = false
  ): Promise<ToolEvaluationResponse> {
    const params = new URLSearchParams();
    if (refreshCache) params.set('refresh', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<ToolEvaluationResponse>(`/tools/${platform}/${name}${query}`);
  }

  async compareTools(
    tools: Array<{ platform: PackagePlatform; name: string }>
  ): Promise<ComparisonResponse> {
    const body: ComparisonRequest = { tools };
    return this.fetch<ComparisonResponse>('/compare', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ============================================================================
  // Search
  // ============================================================================

  async search(request: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.set('q', request.query);
    if (request.limit) params.set('limit', request.limit.toString());
    if (request.category) params.set('category', request.category);
    if (request.minScore) params.set('minScore', request.minScore.toString());

    return this.fetch<SearchResponse>(`/search?${params.toString()}`);
  }

  async semanticSearch(query: string, limit = 10): Promise<SearchResponse> {
    return this.search({ query, limit });
  }

  async findSimilar(platform: PackagePlatform, name: string, limit = 5): Promise<SearchResponse> {
    return this.fetch<SearchResponse>(`/similar/${platform}/${name}?limit=${limit}`);
  }

  // ============================================================================
  // Project Audit
  // ============================================================================

  async auditProject(
    dependencies: Record<string, string>,
    devDependencies?: Record<string, string>
  ): Promise<ProjectAuditResponse> {
    const body = {
      dependencies,
      devDependencies,
    };

    return this.fetch<ProjectAuditResponse>('/audit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async auditPackageJson(packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }): Promise<ProjectAuditResponse> {
    return this.auditProject(packageJson.dependencies ?? {}, packageJson.devDependencies);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async fetch<T>(path: string, options: RequestInit = {}, attempt = 1): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors or 5xx responses
      if (attempt < this.retries && this.shouldRetry(error)) {
        await this.delay(1000 * attempt); // Exponential backoff
        return this.fetch<T>(path, options, attempt + 1);
      }

      throw this.normalizeError(error);
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' || error.name === 'FetchError') {
        return true;
      }
      // Abort errors (timeout)
      if (error.name === 'AbortError') {
        return true;
      }
    }
    return false;
  }

  private async parseError(response: Response): Promise<ProjectModernError> {
    try {
      const body = (await response.json()) as { error?: string };
      return new Error(body.error ?? `HTTP ${response.status}`) as ProjectModernError;
    } catch {
      return new Error(`HTTP ${response.status}: ${response.statusText}`) as ProjectModernError;
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createClient(config: Partial<ClientConfig> = {}): ProjectModernClient {
  const baseUrl = config.baseUrl ?? process.env.MODERN_API_URL ?? 'http://localhost:3000';
  const apiKey = config.apiKey ?? process.env.MODERN_API_KEY ?? undefined;

  return new ProjectModernClient({
    baseUrl,
    apiKey,
    timeout: config.timeout ?? undefined,
    retries: config.retries ?? undefined,
  });
}

// Default client instance
export const defaultClient = createClient();

// ClientConfig type is already exported above

// Re-export types from @projectmodern/types for convenience
export type {
  ProjectModernError,
  PackagePlatform,
  Tool,
  ToolEvaluationResponse,
  ComparisonResponse,
  SearchResponse,
  HealthStatus,
};
