import { describe, it, expect } from 'vitest';
import { DEFAULT_SCORE_WEIGHTS, calculateCompositeScore, type ScoreBreakdown } from '../index.js';

describe('Scoring', () => {
  describe('DEFAULT_SCORE_WEIGHTS', () => {
    it('should have correct weights that sum to 1', () => {
      const { security, maintenance, popularity, ecosystem } = DEFAULT_SCORE_WEIGHTS;
      expect(security).toBe(0.3);
      expect(maintenance).toBe(0.25);
      expect(popularity).toBe(0.25);
      expect(ecosystem).toBe(0.2);
      expect(security + maintenance + popularity + ecosystem).toBe(1);
    });
  });

  describe('calculateCompositeScore', () => {
    it('should calculate correct composite score', () => {
      const breakdown: ScoreBreakdown = {
        security: 8,
        maintenance: 7,
        popularity: 9,
        ecosystem: 6,
      };

      const result = calculateCompositeScore(breakdown);

      // Expected: 8*0.3 + 7*0.25 + 9*0.25 + 6*0.2 = 2.4 + 1.75 + 2.25 + 1.2 = 7.6
      expect(result.overall).toBeCloseTo(7.6, 1);
      expect(result.grade).toBe('B');
      expect(result.breakdown).toEqual(breakdown);
    });

    it('should return grade A for scores >= 8', () => {
      const result = calculateCompositeScore({
        security: 9,
        maintenance: 8,
        popularity: 8,
        ecosystem: 8,
      });
      expect(result.grade).toBe('A');
    });

    it('should return grade F for scores < 2', () => {
      const result = calculateCompositeScore({
        security: 1,
        maintenance: 1,
        popularity: 1,
        ecosystem: 1,
      });
      expect(result.grade).toBe('F');
    });

    it('should return grade D for scores >= 2 and < 4', () => {
      const result = calculateCompositeScore({
        security: 3,
        maintenance: 3,
        popularity: 3,
        ecosystem: 3,
      });
      expect(result.grade).toBe('D');
    });

    it('should include appropriate recommendation for high scores', () => {
      const result = calculateCompositeScore({
        security: 9,
        maintenance: 9,
        popularity: 9,
        ecosystem: 9,
      });
      expect(result.recommendation).toContain('Excellent');
    });

    it('should include warning for low scores', () => {
      const result = calculateCompositeScore({
        security: 3,
        maintenance: 3,
        popularity: 3,
        ecosystem: 3,
      });
      expect(result.recommendation).toContain('caution');
    });
  });
});
