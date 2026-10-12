declare module '*.png' {
  const png: string
  export default png
}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __qiankun_helper__?: {
      bootstrap: () => void;
      mount: () => void;
      unmount: () => void;
      update: () => void;
    };
  }
}
