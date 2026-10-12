declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare const __ENV__: {
  baseApiUrl: string;
  authHeaders?: Record<string, string>;
  appUser?: Record<string, unknown>;
  applicationCode: string;
};
