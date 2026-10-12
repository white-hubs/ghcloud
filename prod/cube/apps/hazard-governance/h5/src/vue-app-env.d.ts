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
};

interface ImportMetaEnv {
  readonly VITE_DEV_AUTH_TOKEN?: string;
  readonly VITE_DEV_AUTH_TENANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
