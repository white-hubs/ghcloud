declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare const __ENV__: {
  applicationCode: string;
};
