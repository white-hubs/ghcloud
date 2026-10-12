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
  v4: vi.fn(() => 'mock-deploy-uuid'),
}));

describe('deploy.service', () => {
  describe('createDeploy', () => {
    it('should generate a UUID for new deploy', async () => {
      const { v4 } = await import('uuid');
      const { createDeploy } = await import('../services/deploy.service');

      await createDeploy('test-task-id', 'qiniu', { bucket: 'test-bucket' }, 'tenant1');

      expect(v4).toHaveBeenCalled();
    });
  });

  describe('updateDeployStatus', () => {
    it('should be a function', async () => {
      const { updateDeployStatus } = await import('../services/deploy.service');
      expect(typeof updateDeployStatus).toBe('function');
    });
  });

  describe('deleteDeploy', () => {
    it('should be a function', async () => {
      const { deleteDeploy } = await import('../services/deploy.service');
      expect(typeof deleteDeploy).toBe('function');
    });
  });
});