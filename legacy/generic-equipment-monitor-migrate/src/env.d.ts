declare const __CONTAINER_ID__: string;
declare const __PUBLIC_PATH__: string;

interface ImportMetaEnv {
  /** 二维组态内置图元静态资源根路径（与 Studio `public` 对齐），例如 `/resource/v1/scada-studio` 或 `https://cdn.example.com/scada-studio` */
  readonly VITE_SCADA_ASSET_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
