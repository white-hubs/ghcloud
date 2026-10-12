import { getImage, intToRoman } from '@/hook/use-utils'
import { middleCardList, smallCardList } from '@/panel.props'
import type { NormDataVO, RealTimeMonitorVO } from '@ghcloud/cube-operating-room-service'
import { defineComponent, ref, watch } from 'vue'
import lodash from 'lodash'
interface Props {
  originalData: RealTimeMonitorVO;
}

/** 护士站卡片 */
export const Card = defineComponent({
  props: ['originalData'],
  setup: (props: Props) => {
    const smallCard = ref(lodash.cloneDeep(smallCardList))
    const middleCard = ref(lodash.cloneDeep(middleCardList))
    const effective = props.originalData.status === 'VALID'
    const level = ref(0)
    const umList = ref<NormDataVO[]>([])

    watch(() => props.originalData, () => {
      // 洁净等级
      level.value = props.originalData.details.find(e => e.normCode === 'cleanlinessLevel')?.value ?? 0

      // μm
      umList.value = props.originalData.details.filter(e => e.normCode?.endsWith('μm'))

      props.originalData.details.forEach(e => {
        const smallItemIndex = smallCard.value.findIndex(ele => ele.code === e.normCode)
        if (smallItemIndex !== -1) {
          smallCard.value[smallItemIndex].unit = e.unit ?? ''
          smallCard.value[smallItemIndex].status = e.status ?? ''
          smallCard.value[smallItemIndex].value = e.value as unknown as undefined
          smallCard.value[smallItemIndex].display = e.display as unknown as number
        }
        const middleItemIndex = middleCard.value.findIndex(ele => ele.code === e.normCode)
        if (middleItemIndex !== -1) {
          middleCard.value[middleItemIndex].unit = e.unit ?? ''
          middleCard.value[middleItemIndex].status = e.status ?? ''
          middleCard.value[middleItemIndex].value = e.value as unknown as undefined
          middleCard.value[middleItemIndex].display = e.display === null ? 1 : Number(e.display)
        }
      })
    }, { immediate: true })

    return (): JSX.Element =>
      <div class='card'>
        <div class='left' v-show={effective}>
          <div class='left-small-card'>
            {
              smallCard.value.map(e => {
                return e.display
                  ? (
                    <div class='item small-card' key={e.title}>
                      <img src={e.iconPath} />
                      <span class='title'>{e.title}</span>
                      <div class='numerical'>
                        <span class={`value color-${e.status}`}>{e.value ?? '--'}</span>
                        <span class='unit'>{e.unit}</span>
                      </div>
                    </div>
                  )
                  : ''
              })
            }
            {
              smallCard.value.filter(e => !e.display).map(e => {
                return <div class='item small-card' key={e.title} style='visibility:hidden' />
              })
            }
          </div>
          <div class='item middle-card' v-show={middleCard.value.filter(e => e.display).length}>
            {
              middleCard.value.filter(e => e.display).map((e, i) => {
                return (
                  <div key={e.title} class={`${(i + 1) % 2 === 0 ? 'driver' : ''} middle-card-item`}>
                    <span class='title'>{e.title}</span>
                    <div class='numerical'>
                      <span class={`value color-${e.status}`}>{e.value ?? '--'}</span>
                      <span class='unit'>{e.unit}</span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div class='item right' v-show={effective}>
          <span class='name'>{props.originalData.operatingRoomName}</span>
          <div class='level'>
            <div class='level-value'>
              <img src={getImage('level-circle.png')} />
              <span class='number'>{effective ? intToRoman(level.value ?? 0) : '--'}</span>
            </div>
            <span class='title'>洁净等级</span>
          </div>
          <div class='um-count' v-show={effective}>
            {
              umList.value.map(e => {
                return (
                  <div class='um-count-item' key={e.normCode}>
                    <span class='title'>{e.normName}</span>
                    <span class='number'>{e.value ?? '--'}{e.unit}</span>
                  </div>
                )
              })
            }
          </div>
        </div>

        {
          (props.originalData.background.url && !effective) &&
            <>
              {props.originalData.background.type === 'image' && <img class='bg-picture' src={props.originalData.background.url} style='width:100%;height:100%' />}
              {props.originalData.background.type === 'video' && <video class='bg-picture' muted autoplay loop src={props.originalData.background.url} style='width:100%;height:100%;object-fit: fill;' />}
            </>
        }
      </div>
  }
})
