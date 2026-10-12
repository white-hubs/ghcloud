declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.png" {
  const png: string;
  export default png;
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean;
  __qiankun_helper__?: {
    bootstrap: () => void;
    mount: () => void;
    unmount: () => void;
    update: () => void;
  };
}
