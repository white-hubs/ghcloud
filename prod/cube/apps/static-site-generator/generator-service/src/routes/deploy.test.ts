import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Route } from './deploy';
import type { DeployRouter } from './deploy';
import { createDeployRoutes } from './deploy';

const mockCreateDeploy = vi.fn().mockResolvedValue({
  id: 'mock-deploy-id',
  taskId: 'mock-task-id',
  provider: 'qiniu',
  providerConfig: { bucket: 'test-bucket' },
  status: 'PENDING',
  tenantCode: 'tenant1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const mockGetDeploy = vi.fn().mockImplementation((id: string) => {
  if (id === 'mock-deploy-id') {
    return Promise.resolve({
      id: 'mock-deploy-id',
      taskId: 'mock-task-id',
      provider: 'qiniu',
      providerConfig: { bucket: 'test-bucket' },
      status: 'PENDING',
      tenantCode: 'tenant1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  }
  return Promise.resolve(null);
});

const mockListDeploys = vi.fn().mockResolvedValue({
  records: [
    {
      id: 'mock-deploy-id',
      taskId: 'mock-task-id',
      provider: 'qiniu',
      providerConfig: { bucket: 'test-bucket' },
      status: 'PENDING',
      tenantCode: 'tenant1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
});

const mockDeleteDeploy = vi.fn().mockResolvedValue(undefined);

vi.mock('../services/deploy.service', () => ({
  createDeploy: mockCreateDeploy,
  getDeploy: mockGetDeploy,
  listDeploys: mockListDeploys,
  deleteDeploy: mockDeleteDeploy,
}));

const createMockRequest = (method: string, url: string, body?: unknown): Request => {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe('deploy routes', () => {
  let router: DeployRouter;
  let routes: Route[];

  beforeEach(() => {
    vi.clearAllMocks();
    router = { routes: [] };
    createDeployRoutes(router);
    routes = router.routes;
  });

  const findRoute = (method: string, path: string): Route | undefined => {
    return routes.find((r) => r.method === method && r.path === path);
  };

  const findRouteWithPattern = (method: string, path: string): Route | undefined => {
    return routes.find((r) => {
      if (r.method !== method || !r.pathPattern) return false;
      return r.pathPattern.test(path);
    });
  };

  describe('POST /deploys', () => {
    it('should be defined', () => {
      const route = findRoute('POST', '/deploys');
      expect(route).toBeDefined();
    });

    it('should have handler function', () => {
      const route = findRoute('POST', '/deploys');
      expect(typeof route?.handler).toBe('function');
    });
  });

  describe('GET /deploys', () => {
    it('should be defined', () => {
      const route = findRoute('GET', '/deploys');
      expect(route).toBeDefined();
    });

    it('should list deploys', async () => {
      const route = findRoute('GET', '/deploys');
      const req = createMockRequest('GET', '/deploys');
      const url = new URL(req.url);
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(1);
      expect(data.data.total).toBe(1);
    });
  });

  describe('GET /deploys/:id', () => {
    it('should be defined with pattern', () => {
      const route = findRouteWithPattern('GET', '/deploys/mock-deploy-id');
      expect(route).toBeDefined();
      expect(route?.pathPattern).toBeDefined();
    });

    it('should get deploy by id', async () => {
      const route = findRouteWithPattern('GET', '/deploys/mock-deploy-id');
      const req = createMockRequest('GET', '/deploys/mock-deploy-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'mock-deploy-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('mock-deploy-id');
    });

    it('should return 404 when deploy not found', async () => {
      const route = findRouteWithPattern('GET', '/deploys/not-found-id');
      const req = createMockRequest('GET', '/deploys/not-found-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'not-found-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /deploys/:id', () => {
    it('should be defined with pattern', () => {
      const route = findRouteWithPattern('DELETE', '/deploys/mock-deploy-id');
      expect(route).toBeDefined();
    });

    it('should delete deploy successfully', async () => {
      const route = findRouteWithPattern('DELETE', '/deploys/mock-deploy-id');
      const req = createMockRequest('DELETE', '/deploys/mock-deploy-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'mock-deploy-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});