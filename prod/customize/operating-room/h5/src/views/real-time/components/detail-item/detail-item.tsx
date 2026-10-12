import { computed, defineComponent, type PropType } from 'vue'
import { DevicePropStatusOptions, type NormDataVO } from '@ghcloud/cube-operating-room-service'
import './detail-item.less'
import { Empty } from 'vant'

export const DetailItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<NormDataVO[]>,
      default: () => {}
    },
    roomStatus: {
      type: Object as PropType<{
        name: string;
        value: number | undefined;
        isOpen: boolean;
      }>,
      default: () => {}
    },
  },
  setup: (props) => {
    const details = computed(() => {
      return props.record
    })
    return (): JSX.Element => (
      <div class='real-list-item'>
        {
          details.value?.length > 0 &&
            <div class='list-item-content'>
              {
                details.value && details.value?.length > 0 && details.value?.map((e) => {
                  return (
                    <div
                      key={e.normCode}
                      class={
                        [
                          'norm-cell-item',
                          Number(e.display) === 1 ? 'show' : 'hide',
                          e.normCode === 'airconditioner' || !props.roomStatus?.isOpen ? 'NORMAL' : DevicePropStatusOptions.find(n => n.value === (e.status as string))?.value ?? 'NORMAL'
                        ]
                      }
                    >
                      <p class='label'>{e.normName}</p>
                      <p class='value'>
                        {
                          e.normCode === 'airconditioner'
                            ? <span class='num font-12'>{props.roomStatus?.name || '--'}</span>
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
        {
          details.value?.length === 0 && <Empty style='width: 100%;' description='暂无数据' />
        }
      </div>
    )
  }
})
