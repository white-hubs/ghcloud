// oxlint-disable max-lines-per-function
// oxlint-disable no-console
// oxlint-disable radix
// oxlint-disable typescript/no-explicit-any
import type { URL } from "url";

export interface Route {
  method: string;
  path: string;
  pathPattern?: RegExp;
  handler: (req: Request, url: URL) => Promise<Response>;
}

export interface TaskRouter {
  routes: Route[];
}

export function createTaskRoutes(router: TaskRouter) {
  router.routes.push({
    method: "POST",
    path: "/tasks",
    handler: async (req) => {
      try {
        const body = await req.json();
        const { url, tenantCode, downloadStatic, excludeHosts } = body;

        if (!url || !tenantCode) {
          return Response.json(
            { success: false, error: { code: "INVALID_PARAMS", message: "Missing required fields: url, tenantCode" } },
            { status: 400 },
          );
        }

        const shouldDownload = downloadStatic === true;
        const { createTask, runTaskFromUrl } = await import("../services/task.service");
        const { normalizeExcludeHosts } = await import("../utils/static-transform");
        const task = await createTask(tenantCode, shouldDownload);

        runTaskFromUrl(task.id, url, normalizeExcludeHosts(excludeHosts)).catch(function () {});

        return Response.json({ success: true, data: task });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: "POST",
    path: "/tasks/upload",
    handler: async (req) => {
      try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const tenantCode = formData.get("tenantCode") as string | null;
        const downloadStaticRaw = formData.get("downloadStatic") as string | null;
        const excludeHostsRaw = formData.get("excludeHosts") as string | null;

        if (!file || !tenantCode) {
          return Response.json(
            { success: false, error: { code: "INVALID_PARAMS", message: "Missing required fields: file, tenantCode" } },
            { status: 400 },
          );
        }

        const shouldDownload = downloadStaticRaw === "true" || downloadStaticRaw === "1";
        const { createTask, saveTaskInputFile, runTask } = await import("../services/task.service");
        const { normalizeExcludeHosts } = await import("../utils/static-transform");
        const task = await createTask(tenantCode, shouldDownload);

        const arrayBuffer = await file.arrayBuffer();
        await saveTaskInputFile(task.id, file.name, arrayBuffer);

        runTask(task.id, normalizeExcludeHosts(excludeHostsRaw)).catch(function () {});

        return Response.json({ success: true, data: task });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: "POST",
    path: "/tasks/byBusinessData",
    handler: async (req) => {
      try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const tenantCode = formData.get("tenantCode") as string | null;
        const downloadStaticRaw = formData.get("downloadStatic") as string | null;
        const excludeHostsRaw = formData.get("excludeHosts") as string | null;

        if (!file || !tenantCode) {
          return Response.json(
            { success: false, error: { code: "INVALID_PARAMS", message: "Missing required fields: file, tenantCode" } },
            { status: 400 },
          );
        }

        const shouldDownload = downloadStaticRaw === "true" || downloadStaticRaw === "1";
        const { createTask, saveTaskInputFile, prepareBusinessDataInput, runTaskFromDirectory } = await import("../services/task.service");
        const { normalizeExcludeHosts } = await import("../utils/static-transform");
        const task = await createTask(tenantCode, shouldDownload);

        const arrayBuffer = await file.arrayBuffer();
        await saveTaskInputFile(task.id, file.name, arrayBuffer);

        await prepareBusinessDataInput(task.id, tenantCode);

        runTaskFromDirectory(task.id, normalizeExcludeHosts(excludeHostsRaw)).catch(function () {});

        return Response.json({ success: true, data: task });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: "GET",
    path: "/tasks",
    handler: async (req, url) => {
      try {
        const status = url.searchParams.get("status");
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

        const { listTasks } = await import("../services/task.service");
        const result = await listTasks(status as any, page, pageSize);
        return Response.json({ success: true, data: { records: result.records, total: result.total, page, pageSize } });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: "GET",
    path: "/tasks/:id",
    pathPattern: /^\/tasks\/(?<id>[^/]+)$/,
    handler: async (req, url) => {
      try {
        const id = (url as any).params?.id;
        if (!id) {
          return Response.json({ success: false, error: { code: "INVALID_PARAMS", message: "Missing task id" } }, { status: 400 });
        }

        const { getTask } = await import("../services/task.service");
        const task = await getTask(id);
        if (!task) {
          return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Task not found" } }, { status: 404 });
        }
        return Response.json({ success: true, data: task });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });

  router.routes.push({
    method: "DELETE",
    path: "/tasks/:id",
    pathPattern: /^\/tasks\/(?<id>[^/]+)$/,
    handler: async (req, url) => {
      try {
        const id = (url as any).params?.id;
        if (!id) {
          return Response.json({ success: false, error: { code: "INVALID_PARAMS", message: "Missing task id" } }, { status: 400 });
        }

        const { deleteTask } = await import("../services/task.service");
        await deleteTask(id);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ success: false, error: { code: "INTERNAL_ERROR", message: String(error) } }, { status: 500 });
      }
    },
  });
}
