import type {
  Tool,
  ToolEvaluationResponse,
  ComparisonResponse,
  HealthStatus,
} from '@projectmodern/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(error.error || `HTTP ${response.status}`, response.status);
  }

  return response.json();
}

export async function evaluateTool(
  platform: string,
  name: string
): Promise<ToolEvaluationResponse> {
  return fetchAPI<ToolEvaluationResponse>(`/tools/${platform}/${name}`);
}

export async function compareTools(
  tools: Array<{ platform: string; name: string }>
): Promise<ComparisonResponse> {
  return fetchAPI<ComparisonResponse>('/compare', {
    method: 'POST',
    body: JSON.stringify({ tools }),
  });
}

export async function searchTools(
  query: string,
  limit = 10
): Promise<{ results: Array<Tool & { similarity: number }> }> {
  return fetchAPI<{ results: Array<Tool & { similarity: number }> }>(
    `/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
}

export async function getHealth(): Promise<HealthStatus> {
  return fetchAPI<HealthStatus>('/health');
}

export { APIError };
