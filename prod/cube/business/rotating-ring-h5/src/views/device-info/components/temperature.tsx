import { computed, defineComponent, onMounted, type PropType } from 'vue'
import '../device-info.less'
import { BarChart } from '@/components/charts/bar-chart'
import type { DeviceAttrItem } from './index'
/** 报表统计 */
export const DeviceTemperature = defineComponent({
  props: {

    attributeVlaue: {
      default: {},
      type: Object as PropType<Record<string, string | number>>,
    },
    propsCodeList: {
      type: Array as PropType<DeviceAttrItem[]>,
      default: [],
    }
  },
  setup: (props) => {
    onMounted(() => {
    })
    const chartsDataList = computed(() => {
      return props.propsCodeList.map(item => {
        return {
          ...item,
          value: Number(props.attributeVlaue[item.propCode])
        }
      })
    })
    return () => (
      <div>
        {chartsDataList.value.map(item => {
          return (
            <div class='input' key={item.propCode}>
              <div class='text_title'>现场数据</div>
              <div class='gauge'>
                <BarChart data={item.value || 0} min={Math.min(...item.dataConstraint)} max={Math.max(...item.dataConstraint)} unit={item.unitName} />
                <div class='gaugetext'>{item.propName}</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  },
})
