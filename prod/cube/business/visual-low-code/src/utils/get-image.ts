const VISUAL_LOW_CODE_IMAGES_BASE = "/resource/v1/visual-low-code/images"

// 获取assets静态图片（已迁移至 MinIO）
export const getAssetsImge = (url: string): string => {
  return `${VISUAL_LOW_CODE_IMAGES_BASE}/${url}`
}
export const getSnImage = (url: string): string => {
  return `${VISUAL_LOW_CODE_IMAGES_BASE}/sn/${url}`
}
