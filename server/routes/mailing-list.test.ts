import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { isValidEmail, normalizeEmail } from '../../shared/email-address.js';

// In-memory stand-in for the Firestore `mailing_list` collection the route uses.
const store = new Map<string, Record<string, unknown>>();
const docIds: string[] = [];

vi.mock('../lib/firebase.js', () => ({
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn((id: string) => {
        docIds.push(id);
        return {
          get: vi.fn(async () => ({ exists: store.has(id), data: () => store.get(id) })),
          set: vi.fn(async (data: Record<string, unknown>) => void store.set(id, data)),
          update: vi.fn(async (data: Record<string, unknown>) => void store.set(id, { ...store.get(id), ...data })),
        };
      }),
    })),
  },
}));
vi.mock('../logger.js', () => ({ logError: vi.fn(), logAPICall: vi.fn() }));

const { default: router } = await import('./mailing-list.js');

type Handler = (req: Request, res: Response) => Promise<unknown>;
function handlerFor(path: string): Handler {
  const layer = (router.stack as Array<{ route?: { path: string; stack: Array<{ handle: Handler }> } }>).find(
    (l) => l.route?.path === path,
  );
  if (!layer?.route) throw new Error(`no route ${path}`);
  return layer.route.stack[0].handle;
}

async function call(path: string, body: unknown) {
  const out: { status: number; body: any } = { status: 200, body: undefined };
  const res = {
    status(code: number) {
      out.status = code;
      return this;
    },
    json(payload: unknown) {
      out.body = payload;
      return this;
    },
  } as unknown as Response;
  await handlerFor(path)({ body } as Request, res);
  return out;
}

const INVALID = ['notanemail', '@example.com', 'test@', 'test..test@example.com', '', '   ', 'a b@example.com', 'user@example', 'user@-example.com', '.user@example.com', 'user.@example.com', 'a/b@example.com'];
const VALID = ['test@example.com', 'user.name@example.co.uk', 'user+tag@example.com', 'test123@test-domain.com', "o'brien@example.ie"];

describe('isValidEmail (shared/email-address.ts)', () => {
  it('rejects malformed addresses', () => {
    for (const email of INVALID) expect(isValidEmail(email), email).toBe(false);
  });
  it('accepts ordinary addresses', () => {
    for (const email of VALID) expect(isValidEmail(email), email).toBe(true);
  });
  it('rejects non-strings and over-long addresses', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
    expect(isValidEmail(`${'a'.repeat(65)}@example.com`)).toBe(false);
    expect(isValidEmail(`a@${'b'.repeat(250)}.com`)).toBe(false);
  });
  it('accepts surrounding whitespace and normalizes case', () => {
    expect(isValidEmail('  Test@Example.com  ')).toBe(true);
    expect(normalizeEmail('  Test@Example.com  ')).toBe('test@example.com');
  });
});

describe('POST /api/mailing-list/subscribe (server/routes/mailing-list.ts)', () => {
  beforeEach(() => {
    store.clear();
    docIds.length = 0;
  });

  it('requires an email', async () => {
    const r = await call('/subscribe', {});
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Email is required');
  });

  it('rejects invalid email format without touching the database', async () => {
    for (const email of INVALID.filter(Boolean)) {
      const r = await call('/subscribe', { email });
      expect(r.status, email).toBe(400);
      expect(r.body.error).toBe('Please enter a valid email address');
    }
    expect(docIds).toEqual([]);
  });

  it('subscribes a new email, stored trimmed and lower-cased', async () => {
    const r = await call('/subscribe', { email: '  Test@Example.com ' });
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ message: 'Successfully subscribed!', success: true });
    const doc = store.get('test@example.com');
    expect(doc).toMatchObject({ email: 'test@example.com', subscribed: true, source: 'website' });
    expect(Number.isNaN(Date.parse(String(doc?.subscribedAt)))).toBe(false);
  });

  it('reports an existing subscriber and resubscribes an unsubscribed one', async () => {
    store.set('existing@example.com', { email: 'existing@example.com', subscribed: true });
    expect((await call('/subscribe', { email: 'existing@example.com' })).body.alreadySubscribed).toBe(true);

    store.set('gone@example.com', { email: 'gone@example.com', subscribed: false });
    const r = await call('/subscribe', { email: 'Gone@example.com' });
    expect(r.body).toEqual({ message: 'Successfully resubscribed!', success: true });
    expect(store.get('gone@example.com')?.subscribed).toBe(true);
  });
});

describe('POST /api/mailing-list/unsubscribe', () => {
  it('rejects invalid email format', async () => {
    const r = await call('/unsubscribe', { email: 'notanemail' });
    expect(r.status).toBe(400);
  });
  it('unsubscribes by normalized address', async () => {
    store.set('test@example.com', { email: 'test@example.com', subscribed: true });
    const r = await call('/unsubscribe', { email: 'TEST@example.com' });
    expect(r.body.success).toBe(true);
    expect(store.get('test@example.com')?.subscribed).toBe(false);
  });
});
