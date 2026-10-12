import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
const imagesModules: Record<string, { default: string; }> = (import.meta as unknown as { glob: (t: string, c: { eager: boolean; }) => Record<string, { default: string; }>; }).glob('../assets/images/**/**', {
  eager: true
})
/**
 * * 获取图片内容
 * @param {CreateComponentType} targetData 配置项
 */
export const fetchImages = async (targetData?: CreateComponentType): Promise<string> => {
  if (!targetData) return ''
  // 正则判断图片是否为 url，是则直接返回该 url
  if (/^(http|https):\/\/([\w.]+\/?)\S*/.test(targetData.key)) return targetData.key
  // 新数据动态处理
  const { key } = targetData
  // 兼容旧数据
  if (key.includes('@') || key.includes('base64')) return key

  const imageName = key.substring(key.lastIndexOf('/') + 1)

  for (const key in imagesModules) {
    const urlSplit = key.split('/')
    if (urlSplit[urlSplit.length - 1].split('.')[0] === imageName) {
      return imagesModules[key]?.default
    }
  }
  return ''
}
