import { defineComponent, type PropType, watch, reactive, ref, onMounted } from 'vue'
import './device-info.less'
import { BarChart } from '../../../../components/bar/bar-chart.tsx'
import { DevicePropCodeEnum, getUpsType, getWorkMode, getBatMode, filterU, filterSame, convertSeconds, handleNull } from '../../index.ts'
import styles from './ups.module.less'
export const DeviceUps = defineComponent({
  props: {

    data: {
      type: Object as PropType<Record<string, string | number>>,
      default: {},
    },
    productPropVoList: {
      type: Array as PropType<{ propCode: string;dataConstraint: number[]; }[]>,
      default: [],
    },
    status: {
      type: Boolean,
      default: true,
    }
  },

  setup: (props) => {
    const attribute = reactive<Record<DevicePropCodeEnum, string>>({
      [DevicePropCodeEnum.UPS_STATUS]: '',
      [DevicePropCodeEnum.WORK_MODE]: '',
      [DevicePropCodeEnum.BAT_TIME]: '',
      [DevicePropCodeEnum.BAT_STATUS]: '',
      [DevicePropCodeEnum.BAT_CAP_P]: '',
      [DevicePropCodeEnum.BAT_CAP]: '',
      [DevicePropCodeEnum.BAT_TEMP]: '',
      [DevicePropCodeEnum.BAT_VOLTAGE]: '',
      [DevicePropCodeEnum.OUT_LOAD_P]: '',
      [DevicePropCodeEnum.OUT_P]: '',
      [DevicePropCodeEnum.IN_P]: '',
      [DevicePropCodeEnum.OUT_FR]: '',
      [DevicePropCodeEnum.IN_FR]: '',
      [DevicePropCodeEnum.IN_U]: '',
      [DevicePropCodeEnum.OUT_U]: '',
      [DevicePropCodeEnum.IN_I]: '',
      [DevicePropCodeEnum.OUT_O]: '',
      [DevicePropCodeEnum.OUT_PA]: '',
      [DevicePropCodeEnum.OUT_PB]: '',
      [DevicePropCodeEnum.OUT_PC]: '',
      [DevicePropCodeEnum.IN_PA]: '',
      [DevicePropCodeEnum.IN_PB]: '',
      [DevicePropCodeEnum.IN_PC]: '',
      [DevicePropCodeEnum.IN_UA]: '',
      [DevicePropCodeEnum.IN_UB]: '',
      [DevicePropCodeEnum.IN_UC]: '',
      [DevicePropCodeEnum.OUT_UA]: '',
      [DevicePropCodeEnum.OUT_UB]: '',
      [DevicePropCodeEnum.OUT_UC]: '',
      [DevicePropCodeEnum.IN_IA]: '',
      [DevicePropCodeEnum.IN_IB]: '',
      [DevicePropCodeEnum.IN_IC]: '',
      [DevicePropCodeEnum.OUT_OA]: '',
      [DevicePropCodeEnum.OUT_OB]: '',
      [DevicePropCodeEnum.OUT_OC]: '',
      [DevicePropCodeEnum.BAT_CURRENT]: ''
    })
    watch(() => props.data, () => {
      Object.assign(attribute, props.data)
    }, { deep: true })

    const productPropVoList = reactive<{
      inv: {
        propCode: DevicePropCodeEnum;
        propName: string;
        dataConstraint: number[];
      }[][];
      outv: {
        propCode: DevicePropCodeEnum;
        propName: string;
        dataConstraint: number[];
      }[][];

    }>({
      inv: [],
      outv: []
    })
    watch(() => props.productPropVoList, () => {
      const isone = filterU(props.productPropVoList).inv.length > 0
      Object.assign(productPropVoList, {
        inv: filterSame(filterU(props.productPropVoList, !isone).inv),
        outv: filterSame(filterU(props.productPropVoList, !isone).outv),
      })
    })
    onMounted(() => {
    })
    /** 输入 */
    const infrequency = ref(0)

    /** 输出 */
    const outfrequency = ref(0)
    /** 电池 */
    const battery = ref(0)
    const battfrequency = ref(0)
    const batteryName = ref('电池电压')
    const batteryUnit = ref('v')
    const batterMax = ref(240)
    const batteryinfo = (code: string, index: number, propName: string, unit: string, propCode: string): void => {
      const currentProp = props.productPropVoList.find(item => item.propCode === propCode)
      if (currentProp) {
        batterMax.value = Math.max(...currentProp.dataConstraint)
      } else {
        batterMax.value = 100
      }
      battery.value = code ? parseInt(code) : 0
      batteryName.value = propName
      battfrequency.value = index
      batteryUnit.value = unit
    }
    const outinfo = (item: { propCode: DevicePropCodeEnum; propName: string; dataConstraint: number[]; }, index: number): void => {
      outfrequency.value = index
    }
    const invinfo = (item: { propCode: DevicePropCodeEnum; propName: string; dataConstraint: number[]; }, index: number): void => {
      infrequency.value = index
    }
    const inshow = ref<boolean>(true)
    const outshow = ref<boolean>(true)
    const inchange = (): void => {
      inshow.value = false
      setTimeout(() => {
        inshow.value = true
      }, 100)
    }
    const outchange = (): void => {
      outshow.value = false
      setTimeout(() => {
        outshow.value = true
      }, 100)
    }
    const active = ref<number>(0)
    const inactive = ref<number>(0)
    watch(() => active.value, inchange)
    watch(() => active.value, outchange)

    return (): JSX.Element => (
      <div>
        {/* <div class='title'>现场数据</div> */}
        <div class='fild_data'>
          <div class='fild_title'>
            现场数据
          </div>
          <div class='fild_content'>
            <div class='fild_devicecode'>
              <div class='value'>
                {
                  getUpsType(props.productPropVoList, attribute.ups_status)
                }
              </div>
              <div class='code'>UPS状态</div>
            </div>
            <div class='fild_devicecode'>
              <div class='value'>
                {
                  getWorkMode(props.productPropVoList, props.data.work_mode as string) ?? '--'
                }
              </div>
              <div class='code'>UPS工作模式</div>
            </div>
            <div class='fild_devicecode'>
              <div class='value'>{props.status ? '在线' : '离线'}</div>
              <div class='code'>通讯状态</div>
            </div>
            <div class='fild_devicecode'>
              <div class='value'>

                {props.data.out1_load_p ? props.data.out1_load_p : 0}%
              </div>
              <div class='code'>USP负载</div>
            </div>
            <div class='fild_devicecode'>
              <div class='value'>
                {
                  getBatMode(props.productPropVoList, props.data.bat_status as string) ?? '--'
                }
              </div>
              <div class='code'>电池状态</div>
            </div>
            <div class='fild_devicecode1' />
          </div>
        </div>
        <div class='input'>
          <div class='text_info'>输入数据</div>
          <div class='input_frequency'><img src='./img/x.png' class='img' alt='' />
            <span>
              频率:
              {
                attribute.in1_fr ? attribute.in1_fr : 0
              }Hz
            </span>
          </div>
          <div class={styles.tabs}>
            {productPropVoList.inv.map((item, index) => {
              return (
                <div
                  class={[styles.tab, active.value === index && styles.active]} key={index} onClick={() => {
                    active.value = index
                  }}
                >输入电压{index + 1}
                </div>
              )
            })}
          </div>
          {productPropVoList.inv.map((item, index) => {
            return (
              <div class={styles.tabContent} key={index} v-show={active.value === index}>
                <div class='voltage'>
                  {
                    item.map((ele, index) => {
                      return (
                        <div
                          class={infrequency.value === index ? 'voltage_div_bg' : 'voltage_div'} key={ele.propCode}
                          onClick={() => {
                            invinfo(ele, index) 
                          }}
                        >
                          <div class='value'>{attribute[ele.propCode] ? attribute[ele.propCode] : 0}v</div>
                          <div class='code'>{ele.propName}</div>
                        </div>
                      )
                    })
                  }
                </div>
                <div class='gauge'>
                  {inshow.value && <BarChart data={handleNull(attribute[item[infrequency.value].propCode])} max={Math.max(...item[infrequency.value].dataConstraint)} unit='v' />}
                  <div class='gaugetext'>{item[infrequency.value].propName}</div>
                </div>
              </div>
            )
          })}

        </div>
        <div class='input'>
          <div class='text_info'>输出数据</div>
          <div class='input_frequency'><img src='./img/x.png' class='img' alt='' />
            <span>
              频率:
              {
                attribute.out1_fr ? attribute.out1_fr : 0
              }Hz
            </span>
          </div>
          <div class={styles.tabs}>
            {productPropVoList.outv.map((item, index) => {
              return (
                <div
                  class={[styles.tab, inactive.value === index && styles.active]} key={index} onClick={() => {
                    inactive.value = index
                  }}
                >输出电压{index + 1}
                </div>
              )
            })}
          </div>
          {productPropVoList.outv.map((item, index) => {
            return (
              <div class={styles.tabContent} key={index} v-show={active.value === index}>
                <div class='voltage'>
                  {
                    item.map((ele, index) => {
                      return (
                        <div
                          class={outfrequency.value === index ? 'voltage_div_bg' : 'voltage_div'} key={ele.propCode}
                          onClick={() => {
                            outinfo(ele, index) 
                          }}
                        >
                          <div class='value'>{attribute[ele.propCode] ? attribute[ele.propCode] : 0}v</div>
                          <div class='code'>{ele.propName}</div>
                        </div>
                      )
                    })
                  }
                </div>
                <div class='gauge'>
                  {inshow.value && <BarChart data={handleNull(attribute[item[outfrequency.value].propCode])} max={Math.max(...item[infrequency.value].dataConstraint)} unit='v' />}
                  <div class='gaugetext'>{item[outfrequency.value].propName}</div>
                </div>
              </div>
            )
          })}
          {/* <Tabs ref={tabInRef} v-model:active={inactive.value}>
            {
         productPropVoList.outv.map((item, index) => {
           return (
             <Tab key={index} title={`输出电压 ${index + 1}`}>
               <div class='voltage'>
                 {
              item.map((ele, index) => {
                return (
                  <div
                    class={outfrequency.value === index ? 'voltage_div_bg' : 'voltage_div'} key={ele.propCode}
                    onClick={() => { outinfo(ele, index) }}
                  >
                    <div class='value'>{attribute[ele.propCode] ? attribute[ele.propCode] : 0}v</div>
                    <div class='code'>{ele.propName}</div>
                  </div>
                )
              })
              }

               </div>
               <div class='gauge'>
                 {outshow.value && <BarChart data={handleNull(attribute[item[outfrequency.value].propCode])} title='设备在线率' unit='v' />}
                 <div class='gaugetext'>{item[outfrequency.value].propName}</div>
               </div>
             </Tab>
           )
         })
            }

          </Tabs> */}

        </div>
        <div class='input'>
          <div class='text_info'>电池数据</div>
          <div class='input_battery'>
            <div class='input_battery_content'>
              <div><img src='./img/d.png' class='img' alt='' /> 电池容量</div>
              <div><img src='./img/b.png' class='img' alt='' />
                {attribute.bat_cap_p ? attribute.bat_cap_p : 0}
                %
              </div>
            </div>
            <div class='input_battery_content'>
              <div><img src='./img/dd.png' class='img' alt='' /> 电池后备时间</div>
              <div>
                {attribute.bat_time ? convertSeconds(attribute.bat_time) : 0}

              </div>
            </div>

          </div>

          <div class='voltage'>
            <div class={battfrequency.value === 0 ? 'voltage_div_bg' : 'voltage_div'} onClick={() => {
              batteryinfo(attribute.bat_voltage, 0, '电池电压', 'v', 'bat_voltage') 
            }}>
              <div class='value'>
                {attribute.bat_voltage ? attribute.bat_voltage : 0}
                v
              </div>
              <div class='code'>电池电压</div>
            </div>
            <div class={battfrequency.value === 1 ? 'voltage_div_bg' : 'voltage_div'} onClick={() => {
              batteryinfo(attribute.bat_current, 1, '电池电流', 'A', 'bat_current') 
            }}>
              <div class='value'>
                {attribute.bat_current ? attribute.bat_current : 0}A
              </div>
              <div class='code'>电池电流</div>
            </div>
            <div class={battfrequency.value === 2 ? 'voltage_div_bg' : 'voltage_div'} onClick={() => {
              batteryinfo(attribute.bat_temp, 2, '电池温度', '℃', 'bat_temp') 
            }}>
              <div class='value'>
                {attribute.bat_temp ? attribute.bat_temp : 0}℃
              </div>
              <div class='code'>电池温度</div>
            </div>

          </div>
          {productPropVoList.inv.length > 0 && (
            <div class='gauge'>
              <BarChart data={battery.value} unit={batteryUnit.value} max={batterMax.value} />
              <div class='gaugetext'>{batteryName.value}</div>
            </div>)}
        </div>

      </div>
    )
  },
})
