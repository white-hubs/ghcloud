/// <reference types="vite/client" />

declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare namespace JSX {
  type Element = import("vue").VNode;
  interface IntrinsicElements {
    [element: string]: unknown;
  }
}

/** Vite `define` 注入的全局常量，见 vite.config.ts */
declare const __ENV__: {
  readonly applicationCode: string;
  readonly baseApiUrl: string;
  readonly authHeaders?: Record<string, string>;
  readonly appUser?: unknown;
};

interface ImportMetaEnv {
  readonly VITE_APPLICATION_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
