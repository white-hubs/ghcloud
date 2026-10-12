import { defineComponent, type PropType, watch, ref } from 'vue'
import styles from './hydraulics.module.less'
import { WaterPolo } from '@/components/charts/water-polo'
/**  液位 */
export const DeviceHydraulics = defineComponent({
  props: {
    hydraulicsData: {
      type: Array as PropType<{ attributeName: string; attributeCode: string;value: string; valueMax: string; }[]>,
      default: [],
    }
  },
  setup: (props) => {
    const hydraulicsData = ref<{ attributeName: string; attributeCode: string; value: string; valueMax: string; }[]>([])
    watch(() => props.hydraulicsData, () => {
      hydraulicsData.value = props.hydraulicsData
    }, { immediate: true, deep: true })
    return () => (
      <div class={styles.input}>
        <div class={styles.text_title}>现场数据</div>
        {
          hydraulicsData.value.map(item =>
            <div class={styles.gauge} key={item.attributeCode}>
              <WaterPolo title={item.attributeName} data={Number(item.value) || 0} max={Number(item.valueMax) || 0} />
              <div class={styles.gaugetext}>{item.attributeName}：{Number(item.value)}㎡</div>
            </div>
          )
        }
      </div>
    )
  },
})
