declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare const __ENV__: {
  readonly applicationCode: string;
};

declare module "*.webp" {
  const src: string;
  export default src;
}
