import { defineComponent, reactive, watch, type PropType } from 'vue'
import { Card } from '../custom-card'
import { Image } from 'vant'
import styles from './index.module.less'
import type { AlarmDetails, MediaState } from '@ghcloud/cube-alarm-center-service'
import { showImagePreview } from '@ghcloud/cube-utils'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

interface SceneSnapVO {
  imagesList: string[];
  videosList: string[];
}

export const SceneSnap = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {}
    },
    mediaList: {
      type: Array as PropType<MediaState[]>,
      default: () => []
    }
  },
  setup: (props) => {
    const serveIp = window.location.protocol
    const state = reactive<SceneSnapVO>({
      imagesList: [],
      videosList: []
    })
    watch(() => props.mediaList, async () => {
      // const session = await cubeLinkageService.getMediasSession()
      const images = props.mediaList.filter(item => item.type === 'PHOTOGRAPH').map(item => {
        return serveIp === 'http:' ? item.intranetFilePath : item.extranetFilePath
      })
      const videos = props.mediaList.filter(item => item.type !== 'PHOTOGRAPH').map(item => {
        return serveIp === 'http:' ? item.intranetFilePath : item.extranetFilePath
      })
      state.imagesList = images.map(item => item)
      state.videosList = videos.map(item => item)
    }, { immediate: true, deep: true })

    const handleImagePreview = (index: number): void => {
      showImagePreview(state.imagesList, index)
    }

    // 补全为完整URL（若已是http/https或协议相对//，则原样返回）
    const toAbsoluteUrl = (url: string): string => {
      if (!url) return ''
      if (/^(https?:)?\/\//i.test(url)) return url
      return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
    }

    // 新增：原生播放触发方法（使用已有的 toAbsoluteUrl）
    const playNative = (index: number): void => {
      cubeAppService.playVideo({
        videoUrl: toAbsoluteUrl(state.videosList[index]),
        videoName: `抓拍视频${index + 1}`
      })
    }

    return (): JSX.Element => (
      <div class={styles.sceneSnap}>
        <Card title='抓拍视频'>
          <div class={styles.snapVideo}>
            {state.videosList.map((item, index) => {
              return (
                <div key={index} style={{ position: 'relative' }}>
                  <video src={item} controls />
                  <div
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      zIndex: 2,
                      background: 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => playNative(index)}
                  >
                    原生播放
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
        <Card title='抓拍图片'>
          <div class={styles.snapImage}>
            {state.imagesList.map((item, index) => {
              return <Image src={item} key={index} onClick={() => handleImagePreview(index)} />
            })}
          </div>
        </Card>
      </div>
    )
  }
})
