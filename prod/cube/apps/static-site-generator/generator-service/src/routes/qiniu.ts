import type { URL } from 'url';
import { refreshQiniuCdn, normalizeDomainToBaseUrl } from '../utils/qiniu-cdn';

export interface Route {
  method: string;
  path: string;
  pathPattern?: RegExp;
  handler: (req: Request, url: URL) => Promise<Response>;
}

export interface QiniuRouter {
  routes: Route[];
}

export function createQiniuRoutes(router: QiniuRouter) {
  router.routes.push({
    method: 'POST',
    path: '/qiniu/refresh',
    handler: async (req) => {
      try {
        const body = await req.json();
        const { accessKey, secretKey, domain, urls, dirs } = body;

        if (!accessKey || !secretKey) {
          return Response.json({ success: false, error: { code: 'INVALID_PARAMS', message: 'Missing required fields: accessKey, secretKey' } }, { status: 400 });
        }

        let refreshUrls: string[] = urls || [];
        let refreshDirs: string[] = dirs || [];

        if (domain) {
          const baseUrl = normalizeDomainToBaseUrl(domain);
          if (refreshUrls.length === 0 && refreshDirs.length === 0) {
            refreshUrls = [baseUrl, `${baseUrl}index.html`];
            refreshDirs = [baseUrl];
          }
        }

        if (refreshUrls.length === 0 && refreshDirs.length === 0) {
          return Response.json({ success: false, error: { code: 'INVALID_PARAMS', message: 'Missing refresh target: provide domain, or urls, or dirs' } }, { status: 400 });
        }

        const result = await refreshQiniuCdn({ accessKey, secretKey, urls: refreshUrls, dirs: refreshDirs });

        if (result.success) {
          return Response.json({ success: true });
        } else {
          return Response.json({ success: false, error: { code: 'REFRESH_FAILED', message: result.message } }, { status: 500 });
        }
      } catch (error) {
        return Response.json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 });
      }
    },
  });
}
