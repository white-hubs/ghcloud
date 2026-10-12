import type { URL } from 'url';

export interface Route {
  method: string;
  path: string;
  pathPattern?: RegExp;
  handler: (req: Request, url: URL) => Promise<Response>;
}

export interface DeployRouter {
  routes: Route[];
}

export function createDeployRoutes(router: DeployRouter) {
  router.routes.push({
    method: 'POST',
    path: '/deploys',
    handler: async (req) => {
      try {
        const body = await req.json();
        const { taskId, provider, providerConfig, tenantCode } = body;

        if (!taskId || !provider || !providerConfig || !tenantCode) {
          return Response.json({ success: false, error: { code: 'INVALID_PARAMS', message: 'Missing required fields' } }, { status: 400 });
        }

        const { createDeploy, runDeploy } = await import('../services/deploy.service');
        const deploy = await createDeploy(taskId, provider, providerConfig, tenantCode);

        runDeploy(deploy.id).catch((function(){}));

        return Response.json({ success: true, data: deploy });
      } catch (error) {
        return Response.json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: 'GET',
    path: '/deploys',
    handler: async (req, url) => {
      try {
        const status = url.searchParams.get('status');
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

        const { listDeploys } = await import('../services/deploy.service');
        const result = await listDeploys(status as any, page, pageSize);
        return Response.json({ success: true, data: { records: result.records, total: result.total, page, pageSize } });
      } catch (error) {
        return Response.json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: 'GET',
    path: '/deploys/:id',
    pathPattern: /^\/deploys\/(?<id>[^/]+)$/,
    handler: async (req, url) => {
      try {
        const id = (url as any).params?.id;
        if (!id) {
          return Response.json({ success: false, error: { code: 'INVALID_PARAMS', message: 'Missing deploy id' } }, { status: 400 });
        }

        const { getDeploy } = await import('../services/deploy.service');
        const deploy = await getDeploy(id);
        if (!deploy) {
          return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, { status: 404 });
        }
        return Response.json({ success: true, data: deploy });
      } catch (error) {
        return Response.json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: 'DELETE',
    path: '/deploys/:id',
    pathPattern: /^\/deploys\/(?<id>[^/]+)$/,
    handler: async (req, url) => {
      try {
        const id = (url as any).params?.id;
        if (!id) {
          return Response.json({ success: false, error: { code: 'INVALID_PARAMS', message: 'Missing deploy id' } }, { status: 400 });
        }

        const { deleteDeploy } = await import('../services/deploy.service');
        await deleteDeploy(id);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 });
      }
    },
  });
}