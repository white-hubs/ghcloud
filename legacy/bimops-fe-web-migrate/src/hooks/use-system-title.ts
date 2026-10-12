import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { subscriber, MFRootEventNameEnum } from "../event";

const STORE_KEY = "system-title-cache";
const FALLBACK_TITLE = "安全指挥调度2.0";
const getDefaultTitle = () => window.config?.systemName || FALLBACK_TITLE;

interface TenantInfo {
  title: string;
  logo?: string;
  tenantId?: string;
}

interface UserCache {
  lastTenantId?: string;
  tenants: { [tenantId: string]: TenantInfo };
}

interface CacheStructure {
  [userId: string]: UserCache;
}

const defaultFavicon = "/favicon.ico";

const cacheService = {
  get(): CacheStructure {
    try {
      const cached = localStorage.getItem(STORE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  },
  set(cache: CacheStructure) {
    localStorage.setItem(STORE_KEY, JSON.stringify(cache));
  },
};

const getLastCachedTenantInfo = (): Partial<TenantInfo> => {
  try {
    const cache = cacheService.get();
    const lastUserId = localStorage.getItem("lastUserId");
    if (!lastUserId) {
      return {};
    }
    const userCache = cache[lastUserId];
    if (!userCache) {
      return {};
    }
    const lastTenantId = userCache.lastTenantId;
    if (!lastTenantId || !userCache.tenants[lastTenantId]) {
      return {};
    }
    return userCache.tenants[lastTenantId];
  } catch (error) {
    return {};
  }
};

const applyBrandingToDocument = (title?: string, logo?: string) => {
  const resolvedTitle = title || getDefaultTitle();
  if (document.title !== resolvedTitle) {
    document.title = resolvedTitle;
  }
  let link = document.querySelector("#dynamic-favicon") as HTMLLinkElement | null;
  if (!link) {
    link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    if (!link.id) {
      link.id = "dynamic-favicon";
    }
    document.head.appendChild(link);
  }
  const nextHref = logo || defaultFavicon;
  if (link.href !== nextHref) {
    link.href = nextHref;
  }
  link.onerror = () => {
    link!.href = defaultFavicon;
  };
};

export const useSystemTitleStore = defineStore("system-title", () => {
  const startupInfo = getLastCachedTenantInfo();
  const userInfo = computed(() => {
    const authInfo = CubeMfRootGlobalState.getInstance().mfRootState.authInfo;
    try {
      const strings = authInfo?.token.split(".") ?? [];
      const userinfo = JSON.parse(decodeURIComponent(escape(window.atob(strings[1].replace(/-/g, "+").replace(/_/g, "/")))));
      return userinfo;
    } catch (e) {}
    // return CubeMfRootGlobalState.getInstance().mfRootState.userInfo
  });
  const systemTitle = ref(getDefaultTitle());
  const systemLogo = ref<string | undefined>(startupInfo.logo);

  applyBrandingToDocument(systemTitle.value, systemLogo.value);

  const setTenantInfo = (info: Partial<TenantInfo>, tenantId: string) => {
    const userId = userInfo.value?.id;
    if (!userId) {
      return;
    }

    const cache = cacheService.get();
    const userCache = cache[userId] || { tenants: {} };
    const tenantInfo = userCache.tenants[tenantId] || { title: getDefaultTitle() };
    const resolvedTitle = getDefaultTitle();

    userCache.tenants[tenantId] = { ...tenantInfo, ...info, title: resolvedTitle };
    systemTitle.value = resolvedTitle;
    if (info.logo) {
      systemLogo.value = info.logo;
    }
    applyBrandingToDocument(systemTitle.value, systemLogo.value);

    cache[userId] = userCache;
    cacheService.set(cache);
  };

  const setLastTenantId = (tenantId: string) => {
    const userId = userInfo.value?.id;
    if (!userId) {
      return;
    }

    const cache = cacheService.get();
    const userCache = cache[userId] || { tenants: {} };
    userCache.lastTenantId = tenantId;
    cache[userId] = userCache;
    cacheService.set(cache);
  };
  const getLastTenantId = (userId: string): string | undefined => {
    const cache = cacheService.get();
    return cache[userId]?.lastTenantId;
  };

  const getTenantInfo = (userId: string, tenantId?: string): TenantInfo => {
    const cache = cacheService.get();
    const userCache = cache[userId];
    if (!userCache) {
      return { title: getDefaultTitle() };
    }

    const id = tenantId || userCache.lastTenantId;
    if (id && userCache.tenants[id]) {
      return { ...userCache.tenants[id], title: getDefaultTitle() };
    }
    return { title: getDefaultTitle() };
  };

  const loadTenantInfoForCurrentUser = () => {
    const userId = userInfo.value?.id;
    if (userId) {
      const info = getTenantInfo(userId);
      systemTitle.value = getDefaultTitle();
      systemLogo.value = info.logo;
      applyBrandingToDocument(systemTitle.value, info.logo);
    }
  };

  const loadInfoForLoginPage = () => {
    const userId = localStorage.getItem("lastUserId");
    if (userId) {
      const lastTenantId = getLastTenantId(userId);
      const info = getTenantInfo(userId, lastTenantId);
      systemTitle.value = getDefaultTitle();
      systemLogo.value = info.logo;
      applyBrandingToDocument(systemTitle.value, info.logo);
      return { ...info, title: systemTitle.value };
    }
    return { title: getDefaultTitle() };
  };

  const handleLogin = (userId?: string) => {
    const id = userId || userInfo.value?.id;
    if (id) {
      localStorage.setItem("lastUserId", id);
    }
  };

  const updateFavicon = (url?: string) => {
    systemLogo.value = url;
    applyBrandingToDocument(systemTitle.value, url);
  };

  const setSystemTitleFromConfig = () => {
    systemTitle.value = getDefaultTitle();
    applyBrandingToDocument(systemTitle.value, systemLogo.value);
  };
  // 获取上次登录的租户
  const lastLoginTenant = () => {
    const userId = userInfo.value?.id || localStorage.getItem("lastUserId");
    if (!userId) {
      return;
    }
    const lastTenantId = getLastTenantId(userId);
    if (lastTenantId) {
      return lastTenantId;
    }
    return "";
  };

  subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_CHANGE_TERMINAL_ALIAS, (aliasInfo) => {
    const code = aliasInfo?.data?.code;
    if (code === "bimops-manage-web") {
      const tenantId = lastLoginTenant();
      if (tenantId) {
        setTenantInfo({}, tenantId);
      }
    }
  });
  return {
    DEFAULT_TITLE: getDefaultTitle(),
    systemTitle,
    systemLogo,
    setTenantInfo,
    setLastTenantId,
    getLastTenantId,
    getTenantInfo,
    loadTenantInfoForCurrentUser,
    loadInfoForLoginPage,
    handleLogin,
    updateFavicon,
    setSystemTitleFromConfig,
    lastLoginTenant,
  };
});
