import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { Image, ImagePreviewGroup, Row, Col, Empty } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { getVideoEventAction } from '@/api/alarm'
export const CaptureVideoRecording = defineComponent({
  setup: () => {
    const route = useRoute()
    const getData = async (): Promise<void> => {
      const res = await getVideoEventAction(route.query.businessKey as string)
      const data = res.data as Record<string, string>[]
      state.imageList = data.filter(item => item.type === 'PHOTOGRAPH')
      state.videoList = data.filter(item => item.type === 'VIDEOTAPE')
    }
    onMounted(() => {
      getData()
    })
    const session = (window as unknown as { session: string; }).session ?? sessionStorage.getItem('videoSession')
    const state = reactive<{ imageList: Record<string, string>[];videoList: Record<string, string>[]; }>({
      imageList: [],
      videoList: []
    })
    return (): JSX.Element => (
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
                        src={item.extranetFilePath + `?session=${session}`} width='520px'
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
            <Row gutter={[32, 32]}>
              {state.videoList.map((item, index) => {
                return (
                  <Col key={index} span={8}>
                    <video controls style={{ width: '520px', height: '300px' }}>
                      <source
                        src={item.extranetFilePath + `?session=${session}`}
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
