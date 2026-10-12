import { defineComponent, onMounted, type PropType, watch, reactive, ref, computed } from 'vue'
import '../device-info.less'
import { batteryfilter, groupArray, type BatteryCode, type DeviceAttrItem, convertSeconds } from './index'
import styles from './battery.module.less'
import { BarChart } from '@/components/charts/bar-chart'
/** 报表统计 */
export const DeviceBattery = defineComponent({
  props: {

    attributeVlaue: {
      default: {},
    },
    propsCodeList: {
      type: Array as PropType<DeviceAttrItem[]>,
      default: [],
    }

  },

  setup: (props) => {
    const activeTab = ref<number>(0)
    const attribute = reactive<BatteryCode>({})

    onMounted(() => {
    })
    watch(() => props.attributeVlaue, () => {
      Object.assign(attribute, props.attributeVlaue)
    }, { deep: true })
    const batteryList = ref<DeviceAttrItem[][]>([])
    watch(() => props.propsCodeList, () => {
      batteryList.value = groupArray(batteryfilter(props.propsCodeList))
    })
    const batteryData = computed(() => {
      return batteryList.value.map(item => {
        return item.map(items => {
          return {
            ...items,
            propValue: attribute[items.propCode],
          }
        })
      })
    })
    const handleTab = (tab: number): void => {
      activeTab.value = tab
    }
    return () => (
      <div class={styles.batteryList}>
        {batteryData.value}
        <div class={styles.title}>现场数据</div>
        <div class={styles.tabs}>
          {
            batteryData.value.map((item, index) => {
              return <div key={index} class={[styles.tab, activeTab.value === index ? styles.active : '']} onClick={() => handleTab(index)}>蓄电池{index + 1}</div>
            })
          }
        </div>
        <div class={styles.content}>
          {
            batteryData.value.map((item, index) => {
              return (
                <div class={styles.tabsContent} key={index} v-show={index === activeTab.value}>
                  <div class={styles.contentTop}>
                    {
                    item.map((sub, idx) => {
                      return (
                        <div key={idx}>
                          {['bat_temp', 'bat_time'].includes(sub.propCode) &&
                            <div class={styles.topItem}>
                              <div class={styles.topLabel}>
                                {sub.propCode === 'bat_temp' ? <img src='./img/temp.png' class='img' alt='' /> : <img src='./img/dd.png' class='img' alt='' />}
                                {sub.propName}
                              </div>
                              <div class={styles.topValue}>
                                <img src='./img/temp-val.png' class='img' alt='' v-show={sub.propCode === 'bat_temp'} />
                                {
                                  sub.propCode === 'bat_temp' ? <span style={{ marginLeft: '10px' }}>{sub.propValue}℃</span> : <span>{convertSeconds(sub.propValue)}</span>
                                }
                              </div>
                            </div>}
                        </div>
                      )
                    })
                  }
                  </div>
                  {item.map((sub, idx) => {
                    return !['bat_temp', 'bat_time'].includes(sub.propCode) && (
                      <div class={styles.contentwarp} key={idx}>
                        <div class={styles.chartLabel}>{sub.propName}</div>
                        <BarChart data={+sub.propValue} max={Math.max(...sub.dataConstraint)} unit={sub.unitName} />
                      </div>
                    )
                  })}
                </div>
              )
            })
          }

        </div>
      </div>
    )
  },
})
