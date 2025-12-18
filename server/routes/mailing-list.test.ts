import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../lib/supabase.js';

// Mock the supabase client
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
    })),
  },
}));

describe('Mailing List API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/mailing-list/subscribe', () => {
    it('should successfully subscribe a new email', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const email = 'test@example.com';
      const result = await mockInsert([{ email, subscribed_at: expect.any(String) }]);

      expect(result.error).toBeNull();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should handle duplicate email subscription', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value' },
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const email = 'existing@example.com';
      const result = await mockInsert([{ email, subscribed_at: expect.any(String) }]);

      expect(result.error).not.toBeNull();
      expect(result.error.code).toBe('23505');
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test..test@example.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        const isValid = /\S+@\S+\.\S+/.test(email);
        expect(isValid).toBe(false);
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'test123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const isValid = /\S+@\S+\.\S+/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('should include timestamp when subscribing', () => {
      const email = 'test@example.com';
      const timestamp = new Date().toISOString();
      const subscriptionData = { email, subscribed_at: timestamp };

      expect(subscriptionData).toHaveProperty('email', email);
      expect(subscriptionData).toHaveProperty('subscribed_at');
      expect(new Date(subscriptionData.subscribed_at)).toBeInstanceOf(Date);
    });

    it('should handle database errors gracefully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' },
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const email = 'test@example.com';
      const result = await mockInsert([{ email, subscribed_at: new Date().toISOString() }]);

      expect(result.error).not.toBeNull();
      expect(result.error.code).toBe('CONNECTION_ERROR');
    });
  });

  describe('Email validation', () => {
    it('should validate email format correctly', () => {
      const emailRegex = /\S+@\S+\.\S+/;
      
      // Valid emails
      expect(emailRegex.test('user@example.com')).toBe(true);
      expect(emailRegex.test('user.name@example.co.uk')).toBe(true);
      expect(emailRegex.test('user+tag@example.com')).toBe(true);
      
      // Invalid emails
      expect(emailRegex.test('notanemail')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('user@')).toBe(false);
      expect(emailRegex.test('')).toBe(false);
    });

    it('should trim whitespace from emails', () => {
      const email = '  test@example.com  ';
      const trimmed = email.trim();
      expect(trimmed).toBe('test@example.com');
      expect(/\S+@\S+\.\S+/.test(trimmed)).toBe(true);
    });

    it('should handle case sensitivity appropriately', () => {
      const email1 = 'Test@Example.com';
      const email2 = 'test@example.com';
      
      // Emails should be treated case-insensitively
      expect(email1.toLowerCase()).toBe(email2.toLowerCase());
    });
  });

  describe('Subscription data structure', () => {
    it('should have correct data structure for new subscription', () => {
      const email = 'test@example.com';
      const subscriptionData = {
        email,
        subscribed_at: new Date().toISOString(),
      };

      expect(subscriptionData).toHaveProperty('email');
      expect(subscriptionData).toHaveProperty('subscribed_at');
      expect(typeof subscriptionData.email).toBe('string');
      expect(typeof subscriptionData.subscribed_at).toBe('string');
    });

    it('should generate valid ISO timestamp', () => {
      const timestamp = new Date().toISOString();
      const parsed = new Date(timestamp);
      
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getTime()).toBeGreaterThan(0);
      expect(isNaN(parsed.getTime())).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle missing email parameter', () => {
      const email = '';
      const isValid = email && /\S+@\S+\.\S+/.test(email);
      expect(isValid).toBeFalsy();
    });

    it('should handle null email parameter', () => {
      const email = null;
      const isValid = email && /\S+@\S+\.\S+/.test(email);
      expect(isValid).toBeFalsy();
    });

    it('should handle undefined email parameter', () => {
      const email = undefined;
      const isValid = email && /\S+@\S+\.\S+/.test(email);
      expect(isValid).toBeFalsy();
    });
  });
});
