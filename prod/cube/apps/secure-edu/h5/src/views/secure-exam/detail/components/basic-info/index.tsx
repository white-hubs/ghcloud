import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import type { ExamDetailState } from '@ghcloud/cube-secure-edu-service'
import dayjs from 'dayjs'
export enum ExamTaskType {
  MERCHANT_EXAM = 'MERCHANT_EXAM',
  STAFF_EXAM = 'STAFF_EXAM',
}
export const ExamTaskTypeOptions = [
  { label: '员工考核', value: ExamTaskType.STAFF_EXAM },
  { label: '商户考核', value: ExamTaskType.MERCHANT_EXAM },
]
export const BasicInfo = defineComponent({
  props: {
    details: {
      type: Object as PropType<ExamDetailState>,
      default: () => {}
    }
  },
  setup: (props) => {
    const examTaskType: Record<string, string> = {
      MERCHANT_EXAM: '商户考核',
      STAFF_EXAM: '员工考核',
    }

    return (): JSX.Element => (
      <div class={styles.basic}>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>考试主题：</div>
          <div class={styles['basic-item-value']}>{props.details.themeName}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>考试类型：</div>
          <div class={styles['basic-item-value']}>{examTaskType[props.details.examTaskType]}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>考试时间：</div>
          <div class={styles['basic-item-value']}>{dayjs(props.details.examStartTime).format('MM-DD HH:mm')} ~ {dayjs(props.details.examEndTime).format('MM-DD HH:mm')}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>负责人：</div>
          <div class={styles['basic-item-value']}>{props.details.chargeUserName || '--'}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>预计参加人数：</div>
          <div class={styles['basic-item-value']}>{props.details.examUserNumber || '--'}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>是否限时：</div>
          <div class={styles['basic-item-value']}>{props.details.timed ? '是' : '否'}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>考试时长：</div>
          <div class={styles['basic-item-value']}>{props.details.examDuration || '--'}分钟</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>是否支持复考：</div>
          <div class={styles['basic-item-value']}>{props.details.retake ? '是' : '否'}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>复考次数：</div>
          <div class={styles['basic-item-value']}>{props.details.retakeNumber || '--'}</div>
        </div>
        <div class={styles['basic-item']}>
          <div class={styles['basic-item-label']}>考试说明：</div>
          <div class={styles['basic-item-value']}>{props.details.remark || '--'}</div>
        </div>
      </div>
    )
  }
})
