const UE5_MIGRATE_ASSETS_BASE = "/resource/v1/ue5-migrate/assets/images";
// 获取assets静态图片（已迁移至 MinIO）
export const getAssetsImage = (url: string): string => `${UE5_MIGRATE_ASSETS_BASE}/${url}`;
export const getDeviceIcon = (name: string): string => `${UE5_MIGRATE_ASSETS_BASE}/device-icon/${name}.png`;
export const getCardIcon = (name: string): string => `${UE5_MIGRATE_ASSETS_BASE}/card-icon/${name}.png`;
/** theme 目录图标：勿用 import，网络资源需走运行时 URL */
export const getThemeImage = (name: string): string => getAssetsImage(`theme/${name.replace(/^\/+/, "")}`);
