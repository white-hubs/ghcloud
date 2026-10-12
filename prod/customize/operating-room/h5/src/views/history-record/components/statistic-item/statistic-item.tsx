import { defineComponent, type PropType } from 'vue'
import { DeviceStatus, type MedicalDeviceHistoryStatisticsVO } from '@ghcloud/cube-operating-room-service'
import { Cell } from 'vant'
import { useRouter } from 'vue-router'
import './statistic-item.less'
import dayjs from 'dayjs'
export const StatisticItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<MedicalDeviceHistoryStatisticsVO>,
      default: () => {}
    },
  },
  setup: (props) => {
    const router = useRouter()
    // 跳转历史记录列表
    const handleList = (): void => {
      router.push({
        path: '/history-list',
        query: {
          id: props.record.deviceId,
        }
      })
    }
    const handleStatus = (status: DeviceStatus): void => {
      router.push({
        path: '/history-list',
        query: {
          id: props.record.deviceId,
          status,
        }
      })
    }
    const titleSlot = {
      title: (): JSX.Element => (
        <div class='title-cell'>
          <span class='text'>{props.record.deviceName ?? '--'}</span>
        </div>
      ),
      value: (): JSX.Element => (
        <div class='text'>{props.record?.monitoringTime ? dayjs(props.record?.monitoringTime).format('YYYY-MM-DD') : ''}</div>
      )
    }
    return (): JSX.Element => (
      <div class='statistic-item'>
        <Cell is-link v-slots={titleSlot} border={false} onClick={handleList} />
        <div class='statistic-item-content'>
          <div class='norm-cell-item' onClick={handleList}>
            <span class='label'>{props.record?.total ?? 0}</span>
            <span class='value'>总记录</span>
          </div>
          <div class='norm-cell-item' onClick={() => {
            handleStatus(DeviceStatus.NORMAL)
          }}>
            <span class='label VALID'>{props.record?.normalTotal ?? 0}</span>
            <span class='value'>正常记录</span>
          </div>
          <div class='norm-cell-item' onClick={() => {
            handleStatus(DeviceStatus.ABNORMAL)
          }}>
            <span class='label ABNORMAL'>{props.record?.abnormalTotal ?? 0}</span>
            <span class='value'>异常记录</span>
          </div>
          <div class='norm-cell-item' onClick={() => {
            handleStatus(DeviceStatus.INVALID)
          }}>
            <span class='label INVALID'>{props.record?.invalidTotal ?? 0}</span>
            <span class='value'>无效记录</span>
          </div>
        </div>

      </div>
    )
  }
})
