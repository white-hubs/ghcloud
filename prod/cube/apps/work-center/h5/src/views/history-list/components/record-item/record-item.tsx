import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import type { WorkTaskPageVO } from '@ghcloud/cube-todo-center-service/src/type'
import { Cell, Tag } from 'vant'
import { ApproveTask, applicationBackgroundColor, applicationTextColor } from '@/utils/types'

export const RecordItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<WorkTaskPageVO>,
      default: () => {}
    },
    recordIndex: {
      type: Number,
      default: () => 0
    },
    userId: {
      type: String,
      default: () => ''
    },
    businessType: {
      type: String,
      default: () => ''
    },
  },
  emits: ['clickRecord', 'handleInfo'],
  setup: (props, { emit }) => {
    // 跳转详情
    const handleDetails = (item: WorkTaskPageVO): void => {
      emit('clickRecord')
    }
    const isApproveTask = (item: WorkTaskPageVO): boolean => {
      return ApproveTask.includes(item?.businessType || '') || item.applicationCode === 'APPROVAL_CENTER'
    }
    return (): JSX.Element => (
      <div class={styles['record-item']} onClick={() => handleDetails(props.record)}>
        <Cell
          is-link
          styles={{ borderRadius: '50%' }}
          clickable
          center
          v-slots={{
            title: () => (
              <div class={[styles['record-item-title']]}>
                <div class={styles['status-level']}>
                    <Tag
                      color={applicationBackgroundColor.get(props.record?.applicationCode || '') ?? '#1578FF19'}
                      text-color={applicationTextColor.get(props.record?.applicationCode || '') ?? '#1578FF'}
                      size='medium'
                    >
                      {props.record?.applicationName}
                    </Tag>
                </div>
                <div class={styles.text}>{props.record?.taskName}</div>
              </div>
            )
          }}
        />
        <div class={styles['record-item-content']}>
          {
            isApproveTask(props.record) ? 
            <>
              <div class={styles['alarm-cell-item']}>
                <span class={styles.label}>发起时间:</span>
                <span class={styles.value}>{props.record?.taskTime ? dayjs(props.record?.taskTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
              </div>
              <div class={styles['alarm-cell-item']}>
                <span class={styles.label}>发起部门:</span>
                <span class={styles.value}>{JSON.parse(props.record?.businessPrincipal ?? JSON.stringify({}))?.organizationName || '--'}</span>
              </div>
            </> 
            : 
            <>
              <div class={styles['alarm-cell-item']}>
                <span class={styles.label}>任务时间:</span>
                <span class={styles.value}>{props.record?.taskTime ? dayjs(props.record?.taskTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
              </div>
              <div class={styles['alarm-cell-item']}>
                <span class={styles.label}>任务类型:</span>
                <span class={styles.value}>{props.record?.businessTypeName || '--'}</span>
              </div>
              <div class={styles['alarm-cell-item']}>
                <span class={styles.label}>任务状态:</span>
                <span class={styles.value}>{props.record?.businessStatusName || '--'}</span>
              </div>
            </>
          }
          
        </div>
      </div>
    )
  }
})
