
import { cubeDeviceCenterService, cubeDeviceSuperviseService } from '@/api/service'
import { VideoType, type DeviceDetailType, type PropType, type VideoEventAction } from '@/types/alarm-type'
import { Col, ImagePreviewGroup, Row, Spin, Image, Empty } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { defineComponent, onMounted, ref } from 'vue'

interface Props {
  id: string;
  businessKey: string;
  alarmStatus: string;
}
/** 设备报警详情-报警快照 */
export const TabPaneAlarmSnapShot = defineComponent({
  props: ['id', 'businessKey', 'alarmStatus'],
  setup: (props: Props) => {
    const loading = ref(false)
    const imageList = ref<VideoEventAction[]>([])
    const videoList = ref<VideoEventAction[]>([])
    const serveIp = window.location.protocol
    const session = (window as unknown as { videoSession: string; })?.videoSession

    const getDetailData = async (): Promise<void> => {
      loading.value = true
      try {
        cubeDeviceSuperviseService.getVideoEventAction(props.businessKey).then(res => {
          const data = res as VideoEventAction[]
          imageList.value = data.filter(item => item.type === VideoType.PHOTOGRAPH)
          videoList.value = data.filter(item => item.type === VideoType.VIDEOTAPE)
        })
      } catch {
      } finally {
        loading.value = false
      }
    }

    const dataSource = ref<PropType[]>([])
    const getData = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.getNorthDeviceDetail({
        deviceId: props.id,
        withPropertySpec: true,
        withSnapShot: true
      })
      dataSource.value = resolvePropValue(res as unknown as DeviceDetailType)
    }
    const resolvePropValue = (dataSource: DeviceDetailType): PropType[] => {
      const list: PropType[] = []
      if (dataSource.snapshots) {
        if (dataSource.productPropVoList) {
          dataSource.productPropVoList.forEach((item) => {
            const current = dataSource.snapshots.filter((s) => {
              return s.key === item.propCode
            })[0]
            if (current) {
              current.name = item.name
              current.unitName = item.unitName
              const config = dataSource.dataConstraint.filter((c) => {
                return c.value === current.val
              })[0]
              current.value = config.label
            }
            list.push(current)
          })
        }
      }
      return list
    }

    onMounted(() => {
      getDetailData()
      getData()
    })
    return (): JSX.Element =>
      <>
        <Spin spinning={loading.value}>
          <VerticalLine title='报警录像' />
          <div>
            {
              videoList.value.length === 0
                ? <Empty description='暂无录像' />
                : <Row type='flex' gutter={[32, 16]}>
                  {
                    videoList.value.map(item => {
                      return (
                        <Col span={8} key={item.id}>
                          <video controls style='width: 520px; height: 300px; object-fit: fill'>
                            <source
                              src={serveIp === 'http'
                                ? item.intranetFilePath + '?session=' + session
                                : item.extranetFilePath + '?session=' + session}
                              type='video/mp4'
                            />
                          </video>
                        </Col>
                      )
                    })
                  }
                </Row>

            }
          </div>
          <VerticalLine title='报警抓拍' />
          {
            imageList.value.length === 0
              ? <Empty description='暂无抓拍' />
              : <Row type='flex' gutter={[32, 16]}>
                <ImagePreviewGroup>
                  {
                    imageList.value.map(item => {
                      return (
                        <Col span={8} key={item.id}>
                          <Image
                            width='520px'
                            height='300px'
                            src={serveIp === 'http'
                              ? item.intranetFilePath + '?session=' + session
                              : item.extranetFilePath + '?session=' + session}
                          />
                        </Col>
                      )
                    })
                  }
                </ImagePreviewGroup>
              </Row>
          }
        </Spin>
      </>
  }
})
