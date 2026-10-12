import { defineComponent, onMounted, reactive, watch } from 'vue'
import styles from './index.module.less'
import { Image, ImagePreviewGroup, Row, Col, Empty } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { getVideoEventAction, loginSession } from '@/api/alarm'
interface Props {
  marketInfo: Record<string, string>;
}

export const CaptureVideoRecording = defineComponent({
  props: {
    marketInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup: (props: Props) => {
    const route = useRoute()
    const videoSession = (window as unknown as { session: string; }).session ?? sessionStorage.getItem('videoSession')
    const state = reactive<{ imageList: Record<string, string>[];videoList: Record<string, string>[];session: string; }>({
      imageList: [],
      videoList: [],
      session: '',
    })
    const getData = async (): Promise<void> => {
      const res = await getVideoEventAction({
        id: route.query.businessKey as string,
        url: props.marketInfo.url,
        tenant: props.marketInfo.tenant,
        token: props.marketInfo.token
      })
      const data = res.data as Record<string, string>[]
      state.imageList = data.filter(item => item.type === 'PHOTOGRAPH')
      state.videoList = data.filter(item => item.type === 'VIDEOTAPE')
    }
    // 获取session
    const getSessionData = async (): Promise<void> => {
      const res = await loginSession({
        url: props.marketInfo.url,
        tenant: props.marketInfo.tenant,
        token: props.marketInfo.token
      })
      state.session = res.data.session ?? videoSession
    }
    onMounted(async () => {
      // await getSessionData()
      // getData()
    })
    watch(() => props.marketInfo, () => {
      // debugger
      getSessionData()
      getData()
    }, { deep: true })
    const getImgUrl = (url: string): string => {
      const path = url ? url.startsWith('http') ? url : `${props.marketInfo.url}/${url}` : ''
      return path + `?session=${state.session}`
    }
    return (): JSX.Element=> (
      <div class={styles['capture-video']}>
        <div class={styles.title}>现场抓拍</div>
        {!!state.imageList.length &&
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[32, 32]}>
              <ImagePreviewGroup>
                {state.imageList.map((item, index) => {
                  return (
                    <Col span={8} key={index}>
                      <Image
                        src={getImgUrl(item.extranetFilePath)} width='520px'
                        height='300px'
                      />
                    </Col>
                  )
                })}

              </ImagePreviewGroup>
            </Row>
          </div>}
        {!state.imageList.length && <Empty description='暂无抓拍' />}
        <div class={styles.title}>现场录像</div>
        {!!state.videoList.length &&
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 0]}>
              {state.videoList.map((item, index) => {
                return (
                  <Col key={index} span={8}>
                    <video controls style={{ width: '520px', height: '300px' }}>
                      <source
                        src={getImgUrl(item.extranetFilePath)}
                        type='video/mp4'
                      />
                    </video>
                  </Col>
                )
              })}
            </Row>
          </div>}
        {!state.videoList.length && <Empty description='暂无录像' />}
      </div>

    )
  }
})
