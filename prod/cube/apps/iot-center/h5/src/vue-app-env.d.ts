declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare const __ENV__: {
  applicationCode: string;
  baseApiUrl: string;
  authHeaders?: unknown;
  appUser?: unknown;
};

interface ImportMetaEnv {
  readonly VITE_SCADA_API_BASE?: string;
  readonly VITE_SCADA_ASSET_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
