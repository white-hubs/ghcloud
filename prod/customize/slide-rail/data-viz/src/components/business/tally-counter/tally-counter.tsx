import { Card } from '@/components/card/card'
import { computed, defineComponent } from 'vue'
import { CardState } from '@/components/card-state/card-state'
import { TallyBaseInfo } from '../tally-base-info/tally-base-info'
import { TallyNumInfo } from '../tally-num-info/tally-num-info'
import { Monitor } from '../monitor/monitor'
import { TallyData } from '../tally-data/tally-data'
import style from './tally-counter.module.less'
import type { MetaInfoState } from '@/types/slide'

interface Props {
  data: MetaInfoState;
}
/** 理货台 */
export const TallyCounter = defineComponent({
  props: ['data'],
  setup: (props: Props) => {
    // 设备名称
    const cardTitle = computed(() => {
      return props.data?.device?.deviceName || ''
    })
    // 设备ID
    const deviceId = computed(() => {
      return props.data?.device?.deviceId || ''
    })
    // 理货状态
    const status = computed(() => {
      return props.data?.slide?.porkArrangeStatus
    })
    // 商铺信息
    const tallyBaseInfo = computed(() => {
      return props.data?.slide?.supplierInfo
    })
    // 理货信息
    const slideInfo = computed(() => {
      return props.data?.slide
    })
    const cardSlots = {
      'card-state': (): JSX.Element => {
        return (
          <CardState state={status.value} />
        )
      },
      'card-body': (): JSX.Element => {
        return (
          <>
            <div class={`${style.mt10}`}>
              <TallyBaseInfo info={tallyBaseInfo.value} />
              <TallyNumInfo info={slideInfo.value} />
              <Monitor id={deviceId.value as string} info={slideInfo.value} />
              <TallyData info={slideInfo.value} />
            </div>
          </>
        )
      },
    }
    return (): JSX.Element => (
      <Card title={cardTitle.value || '理货台'} v-slots={cardSlots} />
    )
  }
})
