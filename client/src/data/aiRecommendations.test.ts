import { describe, it, expect } from 'vitest';
import { getAIRecommendations, getRecommendationExplanation } from './aiRecommendations';

describe('AI Recommendations', () => {
  describe('getAIRecommendations', () => {
    it('should return heart-related products for cardiovascular queries', () => {
      const results = getAIRecommendations('I have heart problems', 4);
      expect(results).toContain('chelohart');
      expect(results).toContain('revilab-ml-04');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return brain products for cognitive queries', () => {
      const results = getAIRecommendations('I need help with memory and focus', 4);
      expect(results).toContain('pinealon');
      expect(results).toContain('revilab-ml-07');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return anti-aging products for aging queries', () => {
      const results = getAIRecommendations('anti-aging solutions', 4);
      expect(results).toContain('revilab-sl-01');
      expect(results).toContain('nmn-powder');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return joint products for arthritis queries', () => {
      const results = getAIRecommendations('joint pain and arthritis', 4);
      expect(results).toContain('cartalax');
      expect(results).toContain('collagen-peptides');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return immune products for immunity queries', () => {
      const results = getAIRecommendations('boost my immune system', 4);
      expect(results).toContain('crystagen');
      expect(results).toContain('revilab-ml-03');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return energy products for fatigue queries', () => {
      const results = getAIRecommendations('I am always tired and have no energy', 4);
      expect(results).toContain('coq10-ubiquinol');
      expect(results).toContain('revilab-ml-02');
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should handle multiple keyword matches', () => {
      const results = getAIRecommendations('I need help with brain health and energy', 4);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(4);
    });

    it('should return empty array for no matches', () => {
      const results = getAIRecommendations('random text with no health keywords', 4);
      expect(results).toEqual([]);
    });

    it('should respect maxResults parameter', () => {
      const results = getAIRecommendations('anti-aging longevity health', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getRecommendationExplanation', () => {
    it('should return specific explanation for heart queries', () => {
      const explanation = getRecommendationExplanation('heart problems');
      expect(explanation).toContain('cardiovascular');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should return specific explanation for brain queries', () => {
      const explanation = getRecommendationExplanation('memory issues');
      expect(explanation).toContain('cognitive');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should return default explanation for no matches', () => {
      const explanation = getRecommendationExplanation('random text');
      expect(explanation).toBe('Based on your health goals, here are my recommendations:');
    });

    it('should prioritize higher priority keywords', () => {
      const explanation = getRecommendationExplanation('I want anti-aging and also better sleep');
      // Anti-aging has priority 10, sleep has priority 9
      expect(explanation).toContain('anti-aging');
    });
  });
});
