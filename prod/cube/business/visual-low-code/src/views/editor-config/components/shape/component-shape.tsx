import { defineComponent, type PropType } from 'vue'
import { getPointStyle, getSizeStyle, mousePointHandle } from '@/utils/style'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import './index.less'
const chartEditStore = useChartEditStore()
export const ComponentShape = defineComponent({
  props: {
    item: {
      type: Object as PropType<CreateComponentType>,
      required: true
    },
    index: {
      type: Number,
      default: 0
    }
  },
  setup: (props, { slots }) => {
    // 锚点
    const pointList = ['t', 'r', 'b', 'l', 'lt', 'rt', 'lb', 'rb']
    // 光标朝向
    const cursorResize = ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se']
    // // 修改朝向
    // pointList = ['t', 'b']
    // cursorResize = ['n', 's']

    return () => (
      <>
        <div class='component-shape'>
          {slots.default?.()}
          <>
            <div class={['shape-mask', 'hover-active']} style={{ ...getSizeStyle(props.item.styles) }}>
              <div class={['shape-mask-select', chartEditStore.getActive.targetId.includes(props.item.id) && 'active']} />
            </div>
          </>
          {/* 锚点 */}
          <>
            {chartEditStore.getActive.targetId.includes(props.item.id) && pointList.map((point: string, index: number) => {
              return <div class={['shape-point', point]} style={{ ...getPointStyle(point, index, props.item.styles, cursorResize) }} key={point} onMousedown={(e) => { mousePointHandle(e, point, props.item) }} />
            })}
          </>
        </div>
      </>
    )
  },
})
