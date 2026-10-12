import { defineComponent, type PropType, ref, watch, computed } from 'vue'
import styles from '../../emergency-drill.module.less'
import { StepCard } from '../step-card/step-card'
// import { getOperatorLogs } from '@/api/alarm'

export const EmergencyFinish = defineComponent({
  name: 'EmergencyFinish',
  props: {
    title: {
      type: String as PropType<string>,
      default: '处置完成'
    },
    step: {
      type: Number as PropType<number>,
      default: 4
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
    totalProcessingTime: {
      type: String as PropType<string>,
      default: ''
    }
  },
  setup (props) {
    const status = ref({ text: '待处理', color: 'waiting' })
    // const operators = ref([])

    // 获取操作日志
    // const getOperatorLog = async (): Promise<void> => {
    //   if (props.alarmDetail?.id) {
    //     operators.value = await getOperatorLogs(props.alarmDetail.id)
    //   }
    // }

    // 监听外部传入的状态变化
    watch(() => props.stepStatus, (newVal) => {
      if (newVal) {
        status.value = {
          text: newVal.status,
          color: newVal.color
        }
      }
      // getOperatorLog()
    }, { immediate: true, deep: true })

    const resultList = [
      '本次本次处置时间过长，建议加强演练和培训',
    ]

    // 随机选择一条处置建议
    const randomResult = computed(() => {
      const randomIndex = Math.floor(Math.random() * resultList.length)
      return resultList[randomIndex]
    })

    const stepSlots = {
      'title-tag': (): JSX.Element => {
        return <span class={[styles.tags, styles[status.value.color]]}>{status.value.text}</span>
      },
      content: (): JSX.Element => {
        return <>
          <div class={styles.stepInfo}>
            <div class={styles.item}>
              <span class={styles.label}>事故原因: {props.alarmDetail?.alarmTypeName ?? '--'}</span>
            </div>
            <div class={styles.item}>
              <span class={styles.label}>处置结果: {status.value.text === '已完成' ? '已完成处置' : '--' }</span>
            </div>
            <div class={styles.item}> 总处理时长: {props.totalProcessingTime || '--'}</div>
            <div class={styles.item}>
              <span class={[styles.label, styles.show]}>AI建议:
                {status.value.text === '已完成' ? randomResult.value : '--'}
              </span>
            </div>
          </div>
        </>
      }
    }

    return (): JSX.Element => (
      <StepCard {...props} v-slots={stepSlots} />
    )
  },
})