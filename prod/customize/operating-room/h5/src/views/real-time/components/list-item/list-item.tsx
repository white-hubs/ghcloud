import { computed, defineComponent, type PropType } from 'vue'
import { DevicePropStatusOptions, DeviceStatusOptions, type RealTimeMonitorVO } from '@ghcloud/cube-operating-room-service'
import { intToRoman } from '@/hook/use-utils'
import { useRouter } from 'vue-router'
import './list-item.less'
import { Cell, Empty, Tag } from 'vant'

export const ListItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<RealTimeMonitorVO>,
      default: () => {}
    },
  },
  emits: ['handleInfo'],
  setup: (props, { emit }) => {
    const router = useRouter()
    // 跳转详情
    const handleDetails = (): void => {
      emit('handleInfo')
      router.push({
        path: '/real-time-detail',
        query: {
          id: props.record.id
        }
      })
    }
    const deviceName = computed(() => {
      return props.record.operatingRoomName ?? ''
    })
    const deviceStatus = computed(() => {
      const status = DeviceStatusOptions.find(n => n.value === (props.record.status as string))
      return status
    })
    const cleanlinessLevel = computed(() => {
      return props.record.details?.find(e => e.normCode === 'cleanlinessLevel')?.value
    })
    const standardNorms = computed(() => {
      return props.record?.details?.filter(n => n.showArea === '1' && Number(n.display) === 1).slice(0, 6) ?? []
    })
    /** 关机手术室，空调状态 1 开机， 0 正常停机 */
    const roomStatus = computed(() => {
      const airValue = (props.record?.details ?? []).find(e => e.normCode === 'airconditioner')?.value
      const name = airValue === 1 ? '开机' : airValue === 0 ? '正常停机' : ''
      return {
        name,
        value: airValue,
        isOpen: airValue === 1,
      }
    })
    const titleSlot = {
      title: (): JSX.Element => (
        <div class='title-cell'>
          <span class='text'>{deviceName.value ?? '--'}</span>
          <Tag style='white-space: nowrap;' color={deviceStatus.value?.bgColor} text-color={deviceStatus.value?.color} size='medium'>洁净等级 {intToRoman(cleanlinessLevel.value || 0)}</Tag>
        </div>
      )
    }
    return (): JSX.Element => (
      <div class='list-item' onClick={handleDetails}>
        <div class='list-item-title'>
          <Cell is-link v-slots={titleSlot} value='更多' border={false} />
        </div>
        {
          standardNorms.value?.length === 0 && <Empty style='width: 100%;' description='暂无数据' />
        }
        {
          standardNorms.value?.length > 0 &&
            <div class='list-item-content'>
              {
                standardNorms.value?.map((e) => {
                  return (
                    <div
                      key={e.normCode}
                      class={
                        [
                          'norm-cell-item',
                          Number(e.display) === 1 ? 'show' : 'hide',
                          e.normCode === 'airconditioner' || !roomStatus.value?.isOpen ? 'NORMAL' : DevicePropStatusOptions.find(n => n.value === (e.status as string))?.value ?? 'NORMAL',
                        ]
                      }
                    >
                      <p class='label'>{e.normName}</p>
                      <p class='value'>
                        {
                          e.normCode === 'airconditioner'
                            ? <span class='num font-12'>{roomStatus.value?.name || '--'}</span>
                            : <span class='num'>{e?.value ?? '--'}</span>
                        }
                        {e.unit}
                      </p>
                    </div>
                  )
                })
              }
            </div>
        }
      </div>
    )
  }
})
