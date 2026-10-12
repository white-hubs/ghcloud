import { defineComponent, ref, type PropType, watch, computed, type VNode } from 'vue'
import '../device-info/device-info.less'
import { BarChart } from '@/components/charts/bar-chart'
import styles from './index.module.less'
import EnumerateAttribute from './device-attribute/enumerate-attribute'
import SwitchAttribute from './device-attribute/switch-attribute'
import SetValueAttribute from './device-attribute/set-value-attribute'
import SetStringAttribute from './device-attribute/set-string-attribute'
import { useRoute } from 'vue-router'
interface DeviceAttrItem {
  dataWrite: number;
  dataType: string;
  propCode: string;
  propName: string;
  propValue: string;
  unitName: string;
  newCode: string;
  dataConstraint: [];
}
/** 报表统计 */
export const DeviceFire = defineComponent({
  props: {
    propsCodeList: {
      type: Array as PropType<DeviceAttrItem[]>,
      default: [],
    },
    attributeVlaue: {
      default: {},
      type: Object as PropType<Record<string, string | number>>,
    },

  },
  setup: (props) => {
    const pressure = ref<number>(0)
    const route = useRoute()
    const dataList = computed(() => {
      return props.propsCodeList.map(item => {
        return {
          ...item,
          propValue: props.attributeVlaue[item.propCode]
        }
      }).filter(item => item.propCode !== 'pressure' && item.dataWrite === 0)
    })
    const readAndWritData = computed(() => {
      return props.propsCodeList.filter(item => item.dataWrite !== 0)
    })
    const operateDom = (item: DeviceAttrItem): VNode | null => {
      let dom: VNode | null = null
      switch (item.dataType.toLowerCase()) {
        case 'enum':
          dom = (
            <div style={{ marginLeft: '10px' }}>
              <div class={styles['monitor-item']}>
                <label>{item.propName}</label>
              </div>
              <EnumerateAttribute
                curValue={props.attributeVlaue[item.propCode] as string}
                attributeItem={item}
                deviceId={route.query.deviceId as string}
              />
            </div>
          )
          break
        case 'boolean':
          dom = (
            <div style={{ marginLeft: '10px' }}>
              <div class={styles['monitor-item']}>
                <label>{item.propName}</label>
              </div>
              <SwitchAttribute
                attributeItem={item}
                curValue={Number(props.attributeVlaue[item.propCode])}
                deviceId={route.query.deviceId as string}
              />
            </div>
          )
          break
        case 'string':
          dom = (
            <SetStringAttribute
              curValue={props.attributeVlaue[item.propCode] as string}
              attributeItem={item}
              deviceId={route.query.deviceId as string}
            />
          )
          break
        default:
          dom = (
            <SetValueAttribute
              curValue={props.attributeVlaue[item.propCode] as string}
              attributeItem={item}
              deviceId={route.query.deviceId as string}
            />
          )
          break
      }
      return dom
    }
    watch(() => props.attributeVlaue, (value) => {
      if (value.pressure) {
        pressure.value = value.pressure as number
      }
    }, { deep: true })
    return () => (
      <div>
        <div class='input'>
          <div class={styles.title}>现场数据</div>
          <div class={styles.normalAttr}>
            {dataList.value.map((item) => {
              return (
                <div class={styles.attrItem} key={item.propCode}>
                  <div class={styles.itemLabel}>{item.propName}</div>
                  <div class={styles.itemValue}>{item.propValue || '--'}{item.unitName}</div>
                </div>
              )
            })}
          </div>
          <div class='cell-monitor-operate'>
            {
                readAndWritData.value?.map((item) =>
                  <div key={item.propCode}>
                    {operateDom(item)}
                  </div>
                )
              }
          </div>
          {Object.keys(props.attributeVlaue).includes('pressure') &&
            <div class='gauge'>
              <BarChart data={pressure.value} unit='%' max={1.6} />
              <div class='gaugetext'>水压mpa</div>
            </div>}
        </div>

      </div>
    )
  },
})
