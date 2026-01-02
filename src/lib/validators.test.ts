import { describe, it, expect } from 'vitest';
import { ProblemRequestSchema, OnboardRequestSchema } from './validators';

describe('validators', () => {
  describe('ProblemRequestSchema', () => {
    it('validates correct input', () => {
      const input = {
        name: 'Two Sum',
        difficulty: 'EASY',
        topic: 'ARRAYS',
        externalUrl: 'https://leetcode.com/problems/two-sum',
        tags: ['array', 'hash-table'],
        notes: 'Easy peasy',
      };
      const result = ProblemRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid difficulty', () => {
      const input = {
        name: 'Two Sum',
        difficulty: 'IMPOSSIBLE',
        topic: 'ARRAYS',
      };
      const result = ProblemRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('OnboardRequestSchema', () => {
    it('validates correct input', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        pledgeDays: 30,
        reminderTime: '09:00',
        timezone: 'UTC',
      };
      const result = OnboardRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const input = {
        name: 'John Doe',
        email: 'not-an-email',
        pledgeDays: 30,
        reminderTime: '09:00',
        timezone: 'UTC',
      };
      const result = OnboardRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
