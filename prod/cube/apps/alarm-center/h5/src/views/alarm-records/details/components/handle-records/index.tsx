import { defineComponent, onMounted, reactive, type PropType } from 'vue'
import styles from './index.module.less'
import { cubeAlarmCenterService } from '../../../../../api/server'
import type { AlarmDetails, OperatorRecord } from '@ghcloud/cube-alarm-center-service'
import dayjs from 'dayjs'
import { Empty, showNotify } from 'vant'
import 'vant/es/notify/style'
export const HandleRecords = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {}
    }
  },
  setup: (props) => {
    const state = reactive<{ records: OperatorRecord[]; }>({
      records: []
    })
    const getRecords = async (): Promise<void> => {
      try {
        const result = await cubeAlarmCenterService.getAlarmHandlerRecords(props.details.businessKey)
        state.records = result
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    onMounted(() => {
      getRecords()
    })
    return (): JSX.Element => (
      <div class={styles.Records}>
        {!!state.records.length &&
          state.records.map(item => {
            return (
              <div class={styles.recordItem} key={item.id}>
                <div class={styles.stepIcon} />
                <div class={styles.time}>
                  {item.operatorTime ? dayjs(item.operatorTime).format('HH:mm:ss') : '--'}
                </div>
                <div class={styles.result}>
                  <div class={styles.person}>{item.operatorByName}</div>
                  <div class={styles.operate}> {item.operatorContent}</div>
                </div>
              </div>
            )
          })}
        {!state.records.length && <Empty description='暂无处理记录' />}

      </div>
    )
  }
})
