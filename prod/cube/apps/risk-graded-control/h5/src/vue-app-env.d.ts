/// <reference types="vite/client" />

declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare const __ENV__: {
  baseApiUrl: string;
  authHeaders?: Record<string, string>;
  appUser?: unknown;
  applicationCode: string;
};
