import { defineComponent, nextTick, ref, type PropType, watch } from 'vue'
import './rank.less'
import { Icon, Empty } from 'vant'

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
    }
  },
  setup (props, { emit }) {
    const rankingList = ref<RankType[]>()
    const showMore = ref(true)
    const maxLineLength = ref<number>(14)
    const lineWidth = ref(400)

    const getRankData = (): void => {
      if (showMore.value) {
        rankingList.value = props.rankData.slice(0, 5)
      } else {
        rankingList.value = props.rankData
      }
      maxLineLength.value = rankingList.value?.map((x) => x.value).sort((a: number, b: number) => b - a)[0] ?? 0
      nextTick(() => {
        const rankDom = document.getElementById('rankingBox')
        lineWidth.value = rankDom ? (rankDom?.clientWidth - 100) : 600
      })
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
    const handleClick = (item: {
      name: string ;value: number;
    }): void => {
      emit('itemClick', item)
    }
    const rankDom = (): JSX.Element =>
      <>
        {
              rankingList.value?.map((item: {
                name: string ;value: number;
              }, index: number) => {
                return (
                  <div key={index} class='rank-box' onClick={() => { handleClick(item) }}>
                    <div class='rank-index'>
                      <div>
                        <div class='index-content'>
                          <img src={`../../assets/images/${index < 3 ? 'rank-icon.png' : 'rank-icon2.png'}`} alt='' />
                          <span class='index-title'>{index + 1}</span>
                        </div>
                      </div>
                    </div>
                    <div class='rank-content'>
                      <div class='rank-value'><span>{item.name}</span><span style={{ fontWeight: '600' }}>{item.value}</span></div>
                      <div class='rank-line'>
                        <div
                          class='current-line' style={
                     `width:${((item.value / maxLineLength.value) * lineWidth.value).toFixed(0)}px;'background:#2879ff' `
}
                        >
                          <div class='line-item' />
                        </div>
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
    return () =>
      <div id='rankingBox' class='rank-wrapper'>
        {
        rankingList.value && rankingList.value?.length > 0
          ? rankDom()
          : <Empty />
       }
      </div>
  }
})
