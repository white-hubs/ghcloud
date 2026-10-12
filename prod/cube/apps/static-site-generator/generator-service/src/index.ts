// oxlint-disable complexity
// oxlint-disable radix
// oxlint-disable no-console
import { URL } from "url";

declare module "bun" {
  interface URL {
    params?: Record<string, string>;
  }
}

import { createDeployRoutes, type DeployRouter } from "./routes/deploy";
import { createQiniuRoutes, type QiniuRouter } from "./routes/qiniu";
import { createTaskRoutes, type TaskRouter } from "./routes/task";

const PORT = parseInt(process.env.PORT || "3000");
const DATA_DIR = process.env.DATA_DIR || "./data";

const taskRouter: TaskRouter = { routes: [] };
const deployRouter: DeployRouter = { routes: [] };
const qiniuRouter: QiniuRouter = { routes: [] };

createTaskRoutes(taskRouter);
createDeployRoutes(deployRouter);
createQiniuRoutes(qiniuRouter);

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const { method } = req;

  for (const route of taskRouter.routes) {
    if (route.method === method && route.path === path) {
      return route.handler(req, url);
    }
    if (route.method === method && route.pathPattern) {
      const match = path.match(route.pathPattern);
      if (match) {
        (url as any).params = match.groups || {};
        return route.handler(req, url);
      }
    }
  }

  for (const route of deployRouter.routes) {
    if (route.method === method && route.path === path) {
      return route.handler(req, url);
    }
    if (route.method === method && route.pathPattern) {
      const match = path.match(route.pathPattern);
      if (match) {
        (url as any).params = match.groups || {};
        return route.handler(req, url);
      }
    }
  }

  for (const route of qiniuRouter.routes) {
    if (route.method === method && route.path === path) {
      return route.handler(req, url);
    }
    if (route.method === method && route.pathPattern) {
      const match = path.match(route.pathPattern);
      if (match) {
        (url as any).params = match.groups || {};
        return route.handler(req, url);
      }
    }
  }

  return new Response("Not Found", { status: 404 });
}

const server = Bun.serve({
  port: PORT,
  maxRequestBodySize: 1024 * 1024 * 1024, // 1GB
  async fetch(req) {
    try {
      return await handleRequest(req);
    } catch (error) {
      return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
    }
  },
});
