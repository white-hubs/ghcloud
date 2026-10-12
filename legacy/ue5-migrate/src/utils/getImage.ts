const UE5_MIGRATE_ASSETS_BASE = '/resource/v1/ue5-migrate/assets/images'
// 获取assets静态图片（已迁移至 MinIO）
export const getAssetsImage = (url: string): string => `${UE5_MIGRATE_ASSETS_BASE}/${url}`
export const getSnImage = (url: string): string => `${UE5_MIGRATE_ASSETS_BASE}/sn/${url}`
export const getDeviceIcon = (name: string): string => `${UE5_MIGRATE_ASSETS_BASE}/device-icon/${name}.png`