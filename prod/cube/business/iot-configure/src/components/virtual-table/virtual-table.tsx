import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, type PropType } from 'vue'
import Table from '@ghcloud/cube-ui/src/components/table/table'
import './virtual-table.less'

export const VirtualTable = defineComponent({
  name: 'VirtualTable',
  props: {
    // 表格数据源
    dataSource: {
      type: Array as PropType<any[]>,
      required: true
    },
    // 表格列定义
    columns: {
      type: Array as PropType<any[]>,
      required: true
    },
    // 表格行高，默认为40px
    rowHeight: {
      type: Number,
      default: 40
    },
    // 表格可视区域高度，默认使用scrollY
    visibleHeight: {
      type: Number,
      default: 0
    },
    // 表格水平滚动宽度
    scrollX: {
      type: Number,
      default: 0
    },
    // 表格垂直滚动高度
    scrollY: {
      type: Number,
      default: 0
    },
    // 缓冲区行数，上下各预加载的行数
    bufferSize: {
      type: Number,
      default: 10
    },
    // 行选择配置
    rowSelection: {
      type: Object,
      default: () => ({})
    },
    // 行键名
    rowKey: {
      type: String,
      default: 'id'
    },
    // 表格大小
    size: {
      type: String,
      default: 'default'
    },
    // 分页配置
    pagination: {
      type: [Object, Boolean],
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 表格类名
    className: {
      type: String,
      default: ''
    },
    // 行类名
    rowClassName: {
      type: Function,
      default: () => null
    }
  },
  setup(props, { attrs, slots, emit }) {
    // 滚动容器引用
    const scrollRef = ref<HTMLDivElement | null>(null)
    // 当前滚动位置
    const scrollTop = ref(0)
    // 可视区域高度
    const containerHeight = computed(() => props.visibleHeight || props.scrollY)
    // 总内容高度
    const totalHeight = computed(() => props.dataSource.length * props.rowHeight)
    
    // 计算可见的起始索引和结束索引
    const visibleRange = computed(() => {
      const start = Math.floor(scrollTop.value / props.rowHeight) - props.bufferSize
      const visibleCount = Math.ceil(containerHeight.value / props.rowHeight) + 2 * props.bufferSize
      const end = start + visibleCount
      
      return {
        start: Math.max(0, start),
        end: Math.min(props.dataSource.length, end)
      }
    })
    
    // 计算可见数据
    const visibleData = computed(() => {
      return props.dataSource.slice(visibleRange.value.start, visibleRange.value.end)
    })
    
    // 计算偏移量，使可见数据在正确的位置
    const offsetY = computed(() => {
      return visibleRange.value.start * props.rowHeight
    })
    
    // 处理滚动事件
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      scrollTop.value = target.scrollTop
    }
    
    // 监听数据源变化，重置滚动位置
    watch(() => props.dataSource, () => {
      if (scrollRef.value) {
        scrollRef.value.scrollTop = 0
        scrollTop.value = 0
      }
    }, { deep: true })
    
    // 组件挂载时添加滚动事件监听
    onMounted(() => {
      if (scrollRef.value) {
        scrollRef.value.addEventListener('scroll', handleScroll)
      }
    })
    
    // 组件卸载前移除滚动事件监听
    onBeforeUnmount(() => {
      if (scrollRef.value) {
        scrollRef.value.removeEventListener('scroll', handleScroll)
      }
    })
    
    // 处理行选择变化
    const handleSelectionChange = (selectedRowKeys: any[], selectedRows: any[]) => {
      if (props.rowSelection && props.rowSelection.onChange) {
        // 将可见行的选择状态映射回完整数据集
        props.rowSelection.onChange(selectedRowKeys, selectedRows)
      }
    }
    
    return () => (
      <div class="virtual-table-container" style={{ height: `${containerHeight.value}px` }} ref={scrollRef}>
        <div class="virtual-table-phantom" style={{ height: `${totalHeight.value}px` }}></div>
        <div class="virtual-table-content" style={{ transform: `translateY(${offsetY.value}px)` }}>
          <Table
            {...attrs}
            dataSource={visibleData.value}
            columns={props.columns}
            rowKey={props.rowKey}
            size={props.size}
            pagination={false}
            loading={props.loading}
            class={`${props.className} virtual-table`}
            row-class-name={props.rowClassName}
            scrollX={props.scrollX}
            rowSelection={props.rowSelection ? {
              ...props.rowSelection,
              fixed: true,  // 固定选择框在左侧
              onChange: handleSelectionChange
            } : undefined}
            v-slots={slots}
          />
        </div>
      </div>
    )
  }
})

export default VirtualTable