import { defineComponent, type PropType, watch, ref } from 'vue'
import type { DeviceAttrItem } from './index'
import styles from './electric.module.less'
import { SimpleGauge } from '@/components/charts/simple-gauge'
/** 报表统计 */
interface FieldData {
  unitName: string;
  propCode: string;
  propName: string;
  value?: string;
  dataConstraint: number[];
}
export const DeviceGas = defineComponent({
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
    const gasData = ref<FieldData>({ propCode: '', value: '', dataConstraint: [], unitName: '', propName: '' })
    watch(() => props.propsCodeList, () => {
      gasData.value = props.propsCodeList[0] ?? { propCode: '', value: 0, dataConstraint: [], unitName: '', propName: '' }
      const currentCode = gasData.value.propCode
      gasData.value.value = props.attributeVlaue[currentCode] as string
    })
    return () => (
      <div class={styles.input}>
        <div class={styles.text_title}>现场数据</div>
        <div class={styles.gauge}>
          <SimpleGauge
            data={Number(gasData.value?.value) || 0}
            min={gasData.value?.dataConstraint[0]}
            max={gasData.value?.dataConstraint[1]}
            unit={gasData.value?.unitName}
            detailPosition={[0, '60%']}
          />
          <div class={styles.gaugetext} style={{ bottom: '50px' }}>{gasData.value?.propName}</div>
        </div>
      </div>

    )
  },
})
