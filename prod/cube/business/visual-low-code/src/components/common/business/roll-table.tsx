import { computed, defineComponent, reactive, type PropType } from 'vue'
import '@/components/common/business/style/roll-table.less'
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
enum Position {
  'left' = 0,
  'center' = 1,
  'right' = 2,
}
interface Columns {
  title: string;
  dataIndex: string;
  width?: string;
  align?: Position;
  slots?: any;
  customRender?: Function;
}
export default defineComponent({
  name: 'RollTable',
  props: {
    column: {
      type: Array as PropType<Columns[]>,
      default: []
    },
    data: {
      type: Array as PropType<any[]>,
      default: []
    },
  },
  setup: (props, { emit }) => {
    const scrollParams = reactive({
      step: 0.5, // 数值越大速度滚动越快
      limitMoveNum: 2, // 开始无缝滚动的数据量 this.dataList.length
      hoverStop: true, // 是否开启鼠标悬停stop
      direction: 1, // 0向下 1向上 2向左 3向右
      openWatch: true, // 开启数据实时监控刷新dom
      singleHeight: 40, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
      singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
      waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
    })
    const styleItem = computed(() => (item: Columns): any => {
      let style: any = {}
      if (item?.width) {
        style = { ...style, width: item.width + 'px' }
      } else {
        style.width = `calc((100 / ${props.column.length})* 1%) `
      }
      if (item?.align) {
        style = { ...style, textAlign: item.align }
      }
      return style
    })
    const clickTableRow = (tr: any): void => {
      emit('clickRow', tr)
    }
    return () => {
      return (
        <>
          <div class='roll-table flex-column'>
            <div class='header flex-between'>
              {
            props.column.map((td, index) =>
              <div
                class='table-th'
                key={index}
                style={styleItem.value(td)}
              >
                {td.title}
              </div>
            )
              }
            </div>
            <div class='scroll_warp'>
              <Vue3SeamlessScroll
                list={props.data}
                step={scrollParams.step}
                hover
                singleHeight={scrollParams.singleHeight}
              >
                {
                  props.data.map((tr, index) =>
                    <div
                      class='table-tr flex-between'
                      key={tr?.key || index}
                      onClick={() => { clickTableRow(tr) }}
                    >
                      {
                         props.column.map((td, j) =>
                           <div
                             class='table-td'
                             key={index + 0 + j}
                             style={styleItem.value(td)}
                           >
                             <span>{tr[td.dataIndex]}</span>
                           </div>

                         )
                      }
                    </div>
                  )
                }
              </Vue3SeamlessScroll>
            </div>
          </div>
        </>
      )
    }
  }
})
