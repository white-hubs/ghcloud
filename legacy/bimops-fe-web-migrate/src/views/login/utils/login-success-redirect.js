/**
 * 登录成功后的跳转：同应用内用 path（可含 query）；完整 http(s) URL 用于跨端口开发。
 * 完整 URL 时会尽量附带 `cube-secret` + `tenant`，便于子应用恢复会话。
 * 粮仓全屏路由（与 meta.isFullWindow 一致）在跳转时补上 `isFullWindow=1`，避免宿主先渲染完整壳层再闪一下。
 * @param {string} pathOrUrl
 * @param {import('vue-router').Router} router
 */
export async function redirectAfterLogin(pathOrUrl, router) {
  if (pathOrUrl == null || pathOrUrl === "") {
    return;
  }
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const withAuth = await appendCubeSecretToUrlIfPossible(pathOrUrl);
    window.location.assign(ensureGranaryPortalFullWindowQueryOnUrl(withAuth));
    return;
  }
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  if (normalized === "/index" || normalized === "/workbench") {
    void router.replace({ path: "/portal-entry" });
    return;
  }
  void router.replace(toSpaReplaceLocation(normalized));
}

/**
 * @param {string} targetUrl
 * @returns {Promise<string>}
 */
async function appendCubeSecretToUrlIfPossible(targetUrl) {
  try {
    const [{ CubeAuthService }, { CubeTerminalEnum }, { CubeMfRootGlobalState }] = await Promise.all([
      import("@ghcloud/cube-auth-service"),
      import("@ghcloud/cube-protocol"),
      import("@ghcloud/cube-mf-root"),
    ]);
    const mf = CubeMfRootGlobalState.getInstance();
    const token = mf.mfRootState.authInfo?.token;
    const tenant = mf.mfRootState.authInfo?.tenant;
    if (typeof token !== "string" || token === "" || typeof tenant !== "string" || tenant === "") {
      return targetUrl;
    }
    const svc = new CubeAuthService(CubeTerminalEnum.BUSINESS, tenant, token);
    const secret = await svc.getSecretByToken();
    const u = new URL(targetUrl);
    u.searchParams.set("cube-secret", secret);
    u.searchParams.set("tenant", tenant);
    return u.toString();
  } catch (_ignore) {
    return targetUrl;
  }
}

/**
 * 与粮仓子应用 `meta.isFullWindow` 约定一致的路径（仅 portal 粮仓）。
 * @param {string} pathname
 * @returns {boolean}
 */
function isGranaryPortalFullWindowPath(pathname) {
  if (!pathname.includes("/portal/granary-management")) {
    return false;
  }
  if (pathname.includes("/main-management/warehouse-detail")) {
    return true;
  }
  if (pathname.endsWith("/statistical-panel")) {
    return true;
  }
  if (pathname.endsWith("/granary-platform-hub")) {
    return true;
  }
  return false;
}

/**
 * @param {URLSearchParams} params
 * @returns {boolean}
 */
function searchParamsImplyFullWindow(params) {
  const raw = params.get("isFullWindow");
  if (raw == null) {
    return false;
  }
  return raw === "1" || raw === "true";
}

/**
 * @param {string} pathWithOptionalQuery
 * @returns {string|import('vue-router').RouteLocationRaw}
 */
function toSpaReplaceLocation(pathWithOptionalQuery) {
  const q = pathWithOptionalQuery.indexOf("?");
  const pathOnly = q >= 0 ? pathWithOptionalQuery.slice(0, q) : pathWithOptionalQuery;
  const search = q >= 0 ? pathWithOptionalQuery.slice(q + 1) : "";
  const params = search === "" ? new URLSearchParams() : new URLSearchParams(search);
  if (isGranaryPortalFullWindowPath(pathOnly) && !searchParamsImplyFullWindow(params)) {
    params.set("isFullWindow", "1");
  }
  const query = Object.fromEntries(params);
  if (Object.keys(query).length === 0) {
    return { path: pathOnly };
  }
  return { path: pathOnly, query };
}

/**
 * @param {string} href
 * @returns {string}
 */
function ensureGranaryPortalFullWindowQueryOnUrl(href) {
  try {
    const u = new URL(href);
    if (!isGranaryPortalFullWindowPath(u.pathname)) {
      return href;
    }
    if (searchParamsImplyFullWindow(u.searchParams)) {
      return href;
    }
    u.searchParams.set("isFullWindow", "1");
    return u.toString();
  } catch (_ignore) {
    return href;
  }
}
