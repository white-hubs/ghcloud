import { defineComponent, ref, type PropType } from 'vue'
import { Button, Cell, CellGroup, Tag, showConfirmDialog, showNotify } from 'vant'
import styles from './record-item.module.less'
import { type HandoverRecordVO } from '@ghcloud/cube-work-center-service/src/type'
import dayjs from 'dayjs'
import { handoverStatusBackgroundColor, handoverStatusTextColor } from '@/utils/types'
import { useGlobalRouter } from '@/hook/use-global-router'
import { cubeWorkCenterService } from '@/api/server'
export const handoverStatus = {
  WAIT_HANDOVER: '待接班',
  HAND_OVERED: '已交班',
  TAKE_OVERED: '已接班',
  CANCEL: '已取消',
}
export const RecordItem = defineComponent({
  name: 'RecordItem',
  props: {
    record: {
      type: Object as PropType<HandoverRecordVO>,
      required: true
    },
    type: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const { record, type } = props
    const { router } = useGlobalRouter()
    const handleTake = (): void => {
      router.push({ path: '/takeover-form', query: { id: record?.id } })
    }
    const loading = ref(false)
    const handleCancel = async (): Promise<void> => {
      showConfirmDialog({
        title: '提示',
        message: `确定要撤销【${record?.recordName}】吗？`
      })
      .then(async () => {
        try {
          loading.value = true
          const params = {
            id: record?.id ?? '',
          }
          await cubeWorkCenterService.handoverCancel(params)
          showNotify({ type: 'success', message: '撤销成功' })
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
          showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        // on cancel
      });
    }

    const handleToDetail = (): void => {
      router.push({ path: '/takeover-form', query: { id: record?.id, isDetailPage: 'true' } })
    }
    return (): JSX.Element => (
      <CellGroup class={styles['handover-cell-group']} onClick={() => handleToDetail()}>
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
                    color={handoverStatusBackgroundColor.get(record?.status || '') ?? '#1578FF19'}
                    text-color={handoverStatusTextColor.get(record?.status || '') ?? '#1578FF'}
                    size='medium'
                  >
                    {handoverStatus[record?.status as keyof typeof handoverStatus] ?? ''}
                  </Tag>
                </div>
                <div class={styles.text}>{record?.recordName}</div>
              </div>
            )
          }}
        />
        <div class={styles['record-item-content']}>
          {
            ['CANCEL', 'WAIT_HANDOVER'].includes(record?.status ?? '') &&
            <>
              <div class={styles['alarm-cell-item']}>
                <span>交班人：{record?.shiftOverUserName ?? '--'}</span>
              </div>
              <div class={styles['alarm-cell-item']}>
                <span>交班时间：{record?.shiftOverTime ? dayjs(record?.shiftOverTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
              </div>
            </> 
          }
          {
            record?.status === 'HAND_OVERED' &&
            <>
              <div class={styles['alarm-cell-item']}>
                <span>接班人：{record?.takeOverUserName ?? '--'}</span>
              </div>
              <div class={styles['alarm-cell-item']}>
                <span>接班时间：{record?.takeOverTime ? dayjs(record?.takeOverTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
              </div>
            </>
          }
          <div class={styles['alarm-cell-item']}>
            <span>交接任务数：{record?.taskNum ?? '--'}</span>
          </div>
          {
            record?.status === 'WAIT_HANDOVER' && 
            <div class={styles['handover-cell-button']}>
              {
                record?.revoke ?
                 <Button type='primary' size='small' style={{ width: '60px' }} onclick={(e: Event) => { e.stopPropagation(); handleCancel() }}>撤销</Button>
                 :
                 <Button type='primary' size='small' style={{ width: '60px' }} onclick={(e: Event) => { e.stopPropagation(); handleTake() }}>接班</Button>
              }
            </div>
          }
        </div>
      </CellGroup>
    )
  }
})