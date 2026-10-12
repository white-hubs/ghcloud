import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import { useRouter } from 'vue-router'
import type { RiskSourceLedgerVO } from '@ghcloud/cube-risk-management-service'
import { timeFormat } from '@/utils'
export const RiskItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<RiskSourceLedgerVO>,
      default: () => {}
    },
    recordIndex: {
      type: Number,
      default: () => 0
    },
  },
  emits: ['changeRecord', 'handleInfo'],
  setup: (props, { emit }) => {
    const router = useRouter()

    // 跳转详情
    const handleDetails = (): void => {
      emit('handleInfo')
      router.push({
        path: '/risk-detail',
        query: {
          id: props.record.id
        }
      })
    }
    const receiveUserTypeList = new Map([
      ['MERCHANT', '商户'],
      ['MARKET', '市场']
    ])
    return (): JSX.Element => (
      <div class={styles['risk-item']} onClick={handleDetails}>
        <div class={[styles['risk-item-title']]}>
          <div class={styles.text}>
            <div class={styles['status-level']}>
              <div class={[styles.status, props.record.status === 'EXPIRE' ? styles.EXPIRE : styles.UNEXPIRE]}>{props.record.status === 'EXPIRE' ? '已过期' : '未过期'}</div>
            </div>
            {props.record.name}
          </div>
        </div>
        <div class={styles['risk-item-content']}>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>风险源分类:</span>
            <span class={styles.value}>{props.record.typeName || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>规格型号:</span>
            <span class={styles.value}>{props.record.norms || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>维护部门:</span>
            <span class={styles.value}>{props.record.maintenanceDepName || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>使用部门:</span>
            <span class={styles.value}>{props.record.receiveDepName || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>使用人员:</span>
            <span class={styles.value}>{props.record.receiveUserName || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>使用人类型:</span>
            <span class={styles.value}>{receiveUserTypeList.get(props.record.receiveUserType ?? '') || '--'}</span>
          </div>
          <div class={styles['alarm-cell-item']}>
            <span class={styles.label}>购买日期:</span>
            <span class={styles.value}>{props.record.purchasingDate ? timeFormat(props.record.purchasingDate ?? '') : '--'}</span>
          </div>
        </div>
      </div>
    )
  }
})
