/// <reference types="vite/client" />

declare module "*.less";

declare global {
  interface Window {
    config?: {
      /** 指挥调度运行时入口 path，优先级低于 VITE_COMMAND_DISPATCH_HOST_PATH */
      commandEntry?: string;
    };
  }

  interface ImportMetaEnv {
    readonly VITE_BUSINESS_PORTAL_ENTRY?: string;
    /** 指挥调度入口 path（默认 `/command-dispatch`，与宿主新开页一致；可改为 `/portal/xxx/` 等） */
    readonly VITE_COMMAND_DISPATCH_HOST_PATH?: string;
    /** 统计大屏「粮食储量与粮情安全监管平台」新窗口地址；未配时 `http://192.168.1.199:8650/` */
    readonly VITE_STATISTICAL_PANEL_GRAIN_SAFETY_PLATFORM_URL?: string;
  }
}

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** 独立打开子应用时 fixed 全屏；qiankun 下由宿主根据 URL 收起壳层 */
    isFullWindow?: boolean;
  }
}
