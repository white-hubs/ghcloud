declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/**
 * Vite `define` 注入的全局常量，见 vite.config.ts。
 * - applicationCode：与 BFF 权限系统对齐的应用码
 */
declare const __ENV__: {
  readonly applicationCode: string;
  readonly mock: boolean;
};

interface ImportMetaEnv {
  readonly VITE_APPLICATION_CODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
