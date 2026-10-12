import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Route } from './task';
import type { TaskRouter } from './task';
import { createTaskRoutes } from './task';

const mockCreateTask = vi.fn().mockResolvedValue({
  id: 'mock-task-id',
  type: 'build',
  status: 'PENDING',
  inputSource: 'url',
  inputData: { url: 'http://test.com' },
  tenantCode: 'tenant1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const mockGetTask = vi.fn().mockImplementation((id: string) => {
  if (id === 'mock-task-id') {
    return Promise.resolve({
      id: 'mock-task-id',
      type: 'build',
      status: 'PENDING',
      inputSource: 'url',
      inputData: { url: 'http://test.com' },
      tenantCode: 'tenant1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  }
  return Promise.resolve(null);
});

const mockListTasks = vi.fn().mockResolvedValue({
  records: [
    {
      id: 'mock-task-id',
      type: 'build',
      status: 'PENDING',
      inputSource: 'url',
      inputData: { url: 'http://test.com' },
      tenantCode: 'tenant1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
});

const mockDeleteTask = vi.fn().mockResolvedValue(undefined);

vi.mock('../services/task.service', () => ({
  createTask: mockCreateTask,
  getTask: mockGetTask,
  listTasks: mockListTasks,
  deleteTask: mockDeleteTask,
}));

const createMockRequest = (method: string, url: string, body?: unknown): Request => {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe('task routes', () => {
  let router: TaskRouter;
  let routes: Route[];

  beforeEach(() => {
    vi.clearAllMocks();
    router = { routes: [] };
    createTaskRoutes(router);
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

  describe('POST /tasks', () => {
    it('should be defined', () => {
      const route = findRoute('POST', '/tasks');
      expect(route).toBeDefined();
    });

    it('should have handler function', () => {
      const route = findRoute('POST', '/tasks');
      expect(typeof route?.handler).toBe('function');
    });
  });

  describe('GET /tasks', () => {
    it('should be defined', () => {
      const route = findRoute('GET', '/tasks');
      expect(route).toBeDefined();
    });

    it('should list tasks', async () => {
      const route = findRoute('GET', '/tasks');
      const req = createMockRequest('GET', '/tasks');
      const url = new URL(req.url);
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(1);
      expect(data.data.total).toBe(1);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should be defined with pattern', () => {
      const route = findRouteWithPattern('GET', '/tasks/mock-task-id');
      expect(route).toBeDefined();
      expect(route?.pathPattern).toBeDefined();
    });

    it('should get task by id', async () => {
      const route = findRouteWithPattern('GET', '/tasks/mock-task-id');
      const req = createMockRequest('GET', '/tasks/mock-task-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'mock-task-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('mock-task-id');
    });

    it('should return 404 when task not found', async () => {
      const route = findRouteWithPattern('GET', '/tasks/not-found-id');
      const req = createMockRequest('GET', '/tasks/not-found-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'not-found-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should be defined with pattern', () => {
      const route = findRouteWithPattern('DELETE', '/tasks/mock-task-id');
      expect(route).toBeDefined();
    });

    it('should delete task successfully', async () => {
      const route = findRouteWithPattern('DELETE', '/tasks/mock-task-id');
      const req = createMockRequest('DELETE', '/tasks/mock-task-id');
      const url = new URL(req.url);
      (url as any).params = { id: 'mock-task-id' };
      const res = await route!.handler(req, url);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});