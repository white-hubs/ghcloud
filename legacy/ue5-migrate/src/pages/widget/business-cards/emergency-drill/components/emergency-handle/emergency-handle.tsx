import { defineComponent, type PropType, computed } from 'vue'
import styles from '../../emergency-drill.module.less'
import { StepCard } from '../step-card/step-card'
import { TimeCountDown } from '../time-count-down/time-count-down'
import { ProfileOutlined, PhoneOutlined } from '@ant-design/icons-vue'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { debounce } from '@/utils/common'

export const EmergencyHandle = defineComponent({
  name: 'EmergencyHandle',
  props: {
    title: {
      type: String as PropType<string>,
      default: '应急处置'
    },
    step: {
      type: Number as PropType<number>,
      default: 3
    },
    active: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    alarmDetail: {
      type: Object as PropType<any>,
      default: () => ({})
    },
    stepStatus: {
      type: Object as PropType<{ status: string; color: string; }>,
      default: () => ({ status: '待处理', color: 'waiting' })
    },
    isProcessing: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    startTime: {
      type: Number as PropType<number>,
      default: 0
    },
    processingTime: {
      type: Number as PropType<number>,
      default: 0
    },
    onCall: {
      type: Function as PropType<() => void>,
      default: () => {}
    },
    onStart: {
      type: Function as PropType<() => void>,
      default: () => {}
    },
    formattedProcessingTime: {
      type: String as PropType<string>,
      default: '00:00'
    },
    alarmHandlerUser: {
      type: Object as PropType<UserInfo>,
      default: () => ({})
    }
  },
  setup (props) {
    const formattedStartTime = computed(() => {
      if (!props.startTime) return '--'
      const date = new Date(props.startTime)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    })

    const handleCall = debounce(props.onCall, 500)
    const handleStart = debounce(props.onStart, 500)

    const stepSlots = {
      'title-tag': (): JSX.Element => {
        return <span class={[styles.tags, styles[props.stepStatus.color]]}>{props.stepStatus.status}</span>
      },
      'title': (): JSX.Element => {
        if (props.isProcessing && props.startTime > 0) {
          return (
            <div class={styles.time}>
              <TimeCountDown startTime={props.startTime} />
            </div>
          )
        }
        return null
      },
      content: (): JSX.Element => {
        return <>
          <div class={styles.stepInfo}>
            <div class={styles.item}>
              <span class={styles.label}>开始时间: {formattedStartTime.value}</span>
            </div>
            <div class={styles.item}>
              <span class={styles.label}>处置联动</span>
              <span class={styles.btns} onClick={handleStart}>
                <span class={[styles.btn, styles.call]}><ProfileOutlined class={styles.icon} />{props.isProcessing ? '完成' : '启动'}</span>
              </span>
            </div>
            <div class={styles.item}>
              <span class={styles.label}>通知人员: {props.alarmHandlerUser?.name || '--'}</span>
              <div class={styles.btns} onClick={handleCall}>
                <span class={[styles.btn, styles.call]}><PhoneOutlined class={styles.icon} />通话</span>
              </div>
            </div>
            {props.stepStatus.status === '已完成' && (
              <div class={styles.item}>
                <span>处理时长: {props.formattedProcessingTime}</span>
              </div>
            )}
          </div>
        </>
      }
    }
    return (): JSX.Element => (
      <StepCard {...props} v-slots={stepSlots} />
    )
  },
})