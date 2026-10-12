type CalcFileType = 'video' | 'audio'
export const videoType = ['mp4', 'AVI', 'WMV', 'MOV', 'MKV', 'FLV', 'WEBM']
export const audioType = ['mp3', 'wav', 'aac', 'flac', 'ogg']
// 计算视频文件时长
export const calcMediaTime = async (filePath: string, type: CalcFileType): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('文件路径为空'))
    }
    const media = document.createElement(type)
    media.preload = 'metadata'
    media.src = filePath
    media.onloadedmetadata = (): void => {
      const duration = Math.ceil(media.duration)
      resolve(duration)
    }
    media.onerror = (): void => {
      reject(new Error('--'))
    }
  })
}
//
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours}小时${minutes}分钟${remainingSeconds}秒`
}
