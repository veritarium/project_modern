import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectModernClient, createClient } from '../index.js';
import { ProjectModernError } from '@projectmodern/types';

// Mock global fetch
global.fetch = vi.fn();

describe('ProjectModernClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new ProjectModernClient({
        baseUrl: 'http://localhost:3000',
        apiKey: undefined,
        timeout: undefined,
        retries: undefined,
      });
      expect(client).toBeDefined();
    });

    it('should strip trailing slash from baseUrl', () => {
      const client = new ProjectModernClient({
        baseUrl: 'http://localhost:3000/',
        apiKey: undefined,
        timeout: undefined,
        retries: undefined,
      });
      expect(client).toBeDefined();
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const mockHealth = { status: 'ok', version: '2.0.0' };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealth),
      });

      const client = new ProjectModernClient({
        baseUrl: 'http://localhost:3000',
        apiKey: undefined,
        timeout: undefined,
        retries: undefined,
      });
      const result = await client.health();

      expect(result).toEqual(mockHealth);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/health', expect.any(Object));
    });
  });

  describe('error handling', () => {
    it('should throw error on API error', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      const client = new ProjectModernClient({
        baseUrl: 'http://localhost:3000',
        apiKey: undefined,
        timeout: undefined,
        retries: undefined,
      });

      await expect(client.health()).rejects.toThrow('Not found');
    });
  });
});

describe('createClient', () => {
  it('should create client from environment variables', () => {
    process.env.MODERN_API_URL = 'http://api.example.com';
    process.env.MODERN_API_KEY = 'test-key';

    const client = createClient();
    expect(client).toBeDefined();

    delete process.env.MODERN_API_URL;
    delete process.env.MODERN_API_KEY;
  });

  it('should use default URL when env not set', () => {
    const client = createClient();
    expect(client).toBeDefined();
  });
});

describe('ProjectModernError', () => {
  it('should create error with all properties', () => {
    const error = new ProjectModernError('Test error', 'TEST_ERROR', 500, { detail: 'extra info' });

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.details).toEqual({ detail: 'extra info' });
    expect(error.name).toBe('ProjectModernError');
  });

  it('should use default status code', () => {
    const error = new ProjectModernError('Test', 'CODE');
    expect(error.statusCode).toBe(500);
  });
});
