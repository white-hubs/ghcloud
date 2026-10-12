import { defineComponent, onMounted, reactive } from 'vue'
import { Row, Col, Spin } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { alarmInfoConfig, alarmHandleConfig, alarmPendingConfig } from './index.config'
import { useRoute } from 'vue-router'
import { getAlarmDetail } from '@/api/alarm'
import { CaptureVideoRecording } from './component/capture-video-recording'

export const AlarmInfo = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{ details: Record<string, unknown>;loading: boolean; }>({
      details: {},
      loading: false
    })
    const getDetail = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getAlarmDetail(route.query.id as string)
        state.details = data
      } catch {
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getDetail()
    })

    return (): JSX.Element => (
      <>
        <Spin spinning={state.loading}>
          <div class={styles['alarm-info']}>
            <div class={styles.title}>报警信息</div>
            <div class={styles['info-content']}>
              <Row gutter={[32, 32]}>
                {alarmInfoConfig.map(item => {
                  return (
                    <Col key={item.field} span={item.span}>
                      <div class={styles.item}>
                        <label> {item.label}:</label>
                        <span>{item.render(state.details[item.field] as never, state.details)}</span>
                      </div>
                    </Col>
                  )
                })}

              </Row>
            </div>
          </div>
          <CaptureVideoRecording />
          {/* 处理 */}

          {!!state.details.handler &&
            <>
              <div class={styles.title}>处理结果</div>
              <div class={styles['handle-content']}>
                <Row gutter={[32, 32]}>
                  {alarmHandleConfig.map(item => {
                    return (
                      <Col key={item.field} span={24}>
                        <div class={styles.item}>
                          <label> {item.label}:</label>
                          <span>{item.render((state.details.handler as Record<string, unknown>)[item.field] as never)}</span>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </>}

          {/* 挂起 */}
          {
            !!state.details.suspend &&
            <>
              <div class={styles.title}>报警挂起</div>
              <div class={styles['pending-content']}>
                <Row gutter={[32, 32]}>
                  {alarmPendingConfig.map(item => {
                    return (
                      <Col key={item.field} span={24}>
                        <div class={styles.item}>
                          <label> {item.label}:</label>
                          <span>{item.render((state.details.suspend as Record<string, unknown>)[item.field] as never)}</span>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </>
          }

        </Spin>

      </>
    )
  }
})
