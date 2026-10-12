import { defineComponent, reactive, watch } from 'vue'
import { Row, Col, Spin, Image } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { alarmInfoConfig, marketAlarmInfoConfig } from './index.config'
import { useRoute } from 'vue-router'
import { getAlarmDetail } from '@/api/alarm'
import { CaptureVideoRecording } from './component/capture-video-recording'
import dayjs from 'dayjs'

interface Props {
  marketInfo: Record<string, string>;
}

export const AlarmInfo = defineComponent({
  props: {
    marketInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  setup: (props: Props) => {
    const route = useRoute()
    const isMarket = route.query.fromPage === 'market'
    const state = reactive<any>({
      details: {
        handler: {
          alarmHandlerResultName: ''
        }
      },
      loading: false
    })
    const getDetail = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getAlarmDetail({
          id: route.query.id as string,
          url: props.marketInfo.url,
          tenant: props.marketInfo.tenant,
          token: props.marketInfo.token
        })
        state.details = data
        state.details.marketName = route.query.marketName
      } catch {
      } finally {
        state.loading = false
      }
    }
    watch(() => props.marketInfo, () => {
      getDetail()
    }, { deep: true })

    return (): JSX.Element=> (
      <>
        <Spin spinning={state.loading}>
          <div class={styles['alarm-info']}>
            <div class={styles.title}>报警信息</div>
            <div class={styles['info-content']}>
              <Row gutter={[32, 32]}>
                {isMarket
                  ? marketAlarmInfoConfig.map(item => {
                    return (
                      <Col key={item.field as unknown as string} span={item.span}>
                        <div class={styles.item}>
                          <label> {item.label}:</label>
                          <span>{item.render(state.details[item.field as unknown as string] as string)}</span>
                        </div>
                      </Col>
                    )
                  })
                  : alarmInfoConfig.map(item => {
                    return (
                      <Col key={item.field as unknown as string} span={item.span}>
                        <div class={styles.item}>
                          <label> {item.label}:</label>
                          <span>{item.render(state.details[item.field as unknown as string] as string)}</span>
                        </div>
                      </Col>
                    )
                  })}

              </Row>
            </div>
          </div>
          <CaptureVideoRecording marketInfo={props.marketInfo} />
          {
            // state.details.alarmStatus === 'ALARM_HANDLER' || state.details.alarmStatus === 'ALARM_SUSPEND' &&
            <>
              {
                state.details.alarmStatus !== 'ALARM_SUSPEND' &&
                  <div class={styles['alarm-info']}>
                    <div class={styles.title}>处理结果</div>
                    <div class={styles['info-content']}>
                      <Row gutter={[32, 32]}>
                        <Col span='8'>
                          <div>
                            <label>处理结果：</label>
                            <span>{state.details.handler?.alarmHandlerResultName ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>处理时间：</label>
                            <span>{dayjs(state.details.handler?.createTime).format('YYYY-MM-DD HH:mm:ss') ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='24'>
                          <label>现场图片：</label>
                          <span class='form-image'>
                            {state.details.handler?.fileVOS?.map((item: { path: string; }) => {
                              return (
                                <Image src={item.path} width='80px' height='80px' />
                              )
                            })}
                          </span>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>处理说明：</label>
                            <span>{state.details.handler?.alarmHandlerResultRemark ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>操作挂起人员：</label>
                            <span>{state.details.handler?.createUserName ?? '--'}</span>
                          </div>
                        </Col>

                      </Row>
                    </div>
                  </div>
              }
              {
                state.details.alarmStatus === 'ALARM_SUSPEND' &&
                  <div class={styles['alarm-info']}>
                    <div class={styles.title}>{
                      state.details.alarmStatus === 'ALARM_SUSPEND'
                        ? '报警挂起'
                        : state.details.alarmStatus === 'ALARM_HANDLER'
                          ? '处理结果'
                          : ''
                    }
                    </div>
                    <div class={styles['info-content']}>
                      <Row gutter={[32, 32]}>
                        <Col span='8'>
                          <div>
                            <label>预计处理时间：</label>
                            <span>{dayjs(state.details.suspend?.estimatedProcessTime).format('YYYY-MM-DD HH:mm:ss') ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>挂起原因：</label>
                            <span>{state.details.suspend?.remark ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>处理时间：</label>
                            <span>{dayjs(state.details.suspend?.createTime).format('YYYY-MM-DD HH:mm:ss') ?? '--'}</span>
                          </div>
                        </Col>
                        <Col span='24'>
                          <label>现场图片：</label>
                          <span class='form-image'>
                            {state.details.suspend?.fileVOS?.map((item: { path: string; }) => {
                              return (
                                <Image src={item.path} width='80px' height='80px' />
                              )
                            })}
                          </span>
                        </Col>
                        <Col span='8'>
                          <div>
                            <label>操作挂起人员：</label>
                            <span>{state.details.suspend?.createUserName ?? '--'}</span>
                          </div>
                        </Col>

                      </Row>
                    </div>
                  </div>
              }
            </>

          }
        </Spin>

      </>
    )
  }
})
