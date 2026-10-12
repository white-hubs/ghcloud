import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('bun:sqlite', () => {
  const mockDb = {
    run: vi.fn(),
    query: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue(null),
      all: vi.fn().mockReturnValue([]),
    }),
    close: vi.fn(),
  };
  return {
    Database: vi.fn().mockImplementation(() => mockDb),
  };
});

describe('db module', () => {
  describe('getDb', () => {
    it('should return a database instance', async () => {
      const { getDb } = await import('../db');
      const db = getDb();
      expect(db).toBeDefined();
    });

    it('should return the same instance on subsequent calls', async () => {
      const { getDb } = await import('../db');
      const db1 = getDb();
      const db2 = getDb();
      expect(db1).toBe(db2);
    });
  });

  describe('closeDb', () => {
    it('should close the database', async () => {
      const { getDb, closeDb } = await import('../db');
      getDb();
      closeDb();
    });
  });
});