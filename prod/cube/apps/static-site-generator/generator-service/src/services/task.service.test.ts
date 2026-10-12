import { describe, it, expect, vi } from 'vitest';

vi.mock('bun:sqlite', () => ({
  Database: vi.fn().mockImplementation(() => ({
    run: vi.fn(),
    query: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue(null),
      all: vi.fn().mockReturnValue([]),
    }),
    close: vi.fn(),
  })),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

describe('task.service', () => {
  describe('createTask', () => {
    it('should generate a UUID for new task', async () => {
      const { v4 } = await import('uuid');
      const { createTask } = await import('../services/task.service');

      await createTask('url', { url: 'http://test.com' }, 'tenant1');

      expect(v4).toHaveBeenCalled();
    });
  });

  describe('updateTaskStatus', () => {
    it('should be a function', async () => {
      const { updateTaskStatus } = await import('../services/task.service');
      expect(typeof updateTaskStatus).toBe('function');
    });
  });

  describe('deleteTask', () => {
    it('should be a function', async () => {
      const { deleteTask } = await import('../services/task.service');
      expect(typeof deleteTask).toBe('function');
    });
  });
});