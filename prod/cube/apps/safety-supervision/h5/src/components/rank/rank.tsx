import { defineComponent, ref, type PropType, watch } from 'vue'
import './rank.less'
import { Icon, Empty, Progress } from 'vant'
import { getAssetsFile } from '@/utils'

/**  排名组件 */
interface RankType {
  name: string;
  value: number;
}
export const Rank = defineComponent({
  emits: ['itemClick'],
  props: {
    rankData: {
      type: Array as PropType<RankType[]>,
      default: () => []
    },
    maxValue: {
      type: Number,
    },
    unit: {
      type: String,
      default: ''
    }
  },
  setup (props, { emit }) {
    const rankingList = ref<RankType[]>()
    const showMore = ref(true)
    const maxLineLength = ref<number>(14)

    const getRankData = (): void => {
      if (showMore.value) {
        rankingList.value = props.rankData.slice(0, 5)
      } else {
        rankingList.value = props.rankData
      }
      maxLineLength.value = rankingList.value?.map((x) => x.value).sort((a: number, b: number) => b - a)[0] ?? 0
      if (props.maxValue) {
        maxLineLength.value = props.maxValue
      }
    }
    getRankData()
    const getMore = (): void => {
      showMore.value = !!(rankingList.value && rankingList.value.length < 5)
      getRankData()
    }
    const getLess = (): void => {
      showMore.value = !(rankingList.value && rankingList.value.length < 5)

      getRankData()
    }
    const handleClick = (item: RankType): void => {
      emit('itemClick', item)
    }
    const rankDom = (): JSX.Element =>
      <>
        {
          rankingList.value?.map((item, index) => {
            return (
              <div key={index} class='rank-box' onClick={() => {
                handleClick(item)
              }}>
                <div class='rank-index'>
                  <div class='index-content'>
                    <img src={getAssetsFile(`${index < 3 ? 'rank-icon.png' : 'rank-icon2.png'}`)} alt='' srcset='' />
                    <span class='index-title'>{index + 1}</span>
                  </div>
                </div>
                <div class='rank-content'>
                  <div class='rank-value'><span>{item.name}</span><span style={{ fontWeight: '600' }}>{item.value.toString().includes('.') ? item.value.toFixed(1) : item.value}{props.unit}</span></div>
                  <div class='rank-line' style='width:100%'>
                    <Progress percentage={item.value} />
                  </div>
                </div>
              </div>
            )
          })
        }
        {
          rankingList.value && rankingList.value?.length >= 4
            ? showMore.value
              ? <div class='more' onClick={getMore}><Icon name='arrow-down' /><span> 展开全部</span></div>
              : <div class='more' onClick={getLess}><Icon name='arrow-up' /><span> 收起</span></div>
            : null
        }
      </>
    watch(() => props.rankData, () => {
      getRankData()
    })
    return (): JSX.Element =>
      <div id='rankingBox' class='rank-wrapper'>
        {
          rankingList.value && rankingList.value?.length > 0
            ? rankDom()
            : <Empty />
        }
      </div>
  }
})
