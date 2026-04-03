import * as vscode from 'vscode';

const fetch = require('node-fetch');

export interface ToolEvaluation {
  composite: number;
  breakdown: {
    security: number;
    maintenance: number;
    popularity: number;
    ecosystem: number;
  };
  grade: string;
  recommendation: string;
}

export interface ToolData {
  name: string;
  platform: string;
  evaluation: ToolEvaluation;
  sources: {
    scorecard: {
      score: number;
      checks?: Array<{
        name: string;
        score: number;
        reason?: string;
      }>;
      isMock?: boolean;
    };
    libraries: {
      stars?: number;
      forks?: number;
      dependents?: number;
      rank?: number;
      status?: string;
      isMock?: boolean;
    };
    github: {
      stars?: number;
      forks?: number;
      issues?: number;
      isMock?: boolean;
    };
  };
  metadata: {
    description?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    keywords?: string[];
  };
}

export class ProjectModernAPI {
  private cache: Map<string, { data: ToolData; timestamp: number }> = new Map();
  private cacheTtl = 60 * 60 * 1000; // 1 hour

  private get apiUrl(): string {
    return vscode.workspace.getConfiguration('projectModern').get('apiUrl') || 'http://localhost:3000';
  }

  private getCacheKey(platform: string, name: string): string {
    return `${platform}/${name}`;
  }

  private getCached(platform: string, name: string): ToolData | null {
    const key = this.getCacheKey(platform, name);
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(platform: string, name: string, data: ToolData): void {
    const key = this.getCacheKey(platform, name);
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async evaluateTool(platform: string, name: string): Promise<ToolData | null> {
    // Check cache first
    const cached = this.getCached(platform, name);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.apiUrl}/tools/${platform}/${name}`, {
        timeout: 10000
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.setCached(platform, name, data);
      
      return data;
    } catch (error) {
      console.error(`Project Modern API error: ${error}`);
      
      // Check if it's a connection error
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
        throw new Error(
          `Cannot connect to Project Modern API at ${this.apiUrl}. ` +
          `Make sure the API server is running.`
        );
      }
      
      return null;
    }
  }

  async compareTools(tools: Array<{ platform: string; name: string }>): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Project Modern API error: ${error}`);
      throw error;
    }
  }

  getScoreColor(score: number): string {
    if (score >= 8) return '#22c55e'; // green
    if (score >= 6) return '#eab308'; // yellow
    return '#ef4444'; // red
  }

  getScoreIcon(score: number): string {
    if (score >= 8) return '✅';
    if (score >= 6) return '⚠️';
    return '❌';
  }

  formatScore(score: number): string {
    const icon = this.getScoreIcon(score);
    return `${icon} ${score.toFixed(1)}/10`;
  }
}
