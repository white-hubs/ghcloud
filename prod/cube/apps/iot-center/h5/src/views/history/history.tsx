import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './history.module.less'
import { TimePicker } from '@/components/time-picker/time-picker'
import { timeFormat, timePeriod } from '@/utils'
import { Empty, Picker, Popup } from 'vant'
import { useRoute } from 'vue-router'
import { cubeDeviceCenterService, cubeSecurityService } from '@/api/server'
import { Rank } from '@/components/echart/rank'
import type { HistoryGroup, ProductPropVoList } from '@ghcloud/cube-iot-center-service'
import { HistoryLineChart } from './components/history-line-echart/history-line-echart'
import { HistoryLineChartE } from './components/history-line-echart-e/history-line-echart-e'
/** 报表统计 */
export const History = defineComponent({
  setup: () => {
    const route = useRoute()
    const deviceId = route.query.id as string ?? ''
    const applicationCode = route.query.applicationCode as string ?? ''
    const deviceAttrList = ref<ProductPropVoList[]>([])
    const showPicker = ref(false)
    const currenAttr = ref('')
    const currenAttrLabel = ref('')
    const time = reactive({ value: timePeriod(), name: 'TODAY' })
    const deviceOption = ref<{ label: string;value: string;dataType: string; }[]>([])
    const historyData = ref<HistoryGroup[] | HistoryGroup[][]>([])
    const historyDataE = ref()
    // 获取历史数据
    const getHistoryList = async (): Promise<void> => {
      try {
        if (applicationCode === 'ELECTRICMANAGE') {
          const query = {
            deviceId,
            attributives: [currenAttr.value],
            period: time.value
          }
          cubeSecurityService.getHistorical(query).then(res => {
            const key = Object.keys(res)?.[0] ?? ''
            historyDataE.value = res[key] 
          })
        } else {
          const params = {
            deviceId,
            propCodes: currenAttr.value,
            startTs: new Date(time.value.split(',')[0]).getTime(),
            endTs: new Date(time.value.split(',')[1]).getTime(),
          }
           
          cubeDeviceCenterService.getDevicePropHistoryGroup(params).then(res => {
            if (['string', 'boolean', 'enum'].includes(deviceAttrList.value.find((e: ProductPropVoList) => e.propCode === currenAttr.value)?.dataType ?? '')) {
              historyData.value = (Object.values(res)[0] as unknown as HistoryGroup[]).map(e => {
                const productPropVo = deviceAttrList.value.find(ele => ele.propCode === e.key)
                return {
                  ...e,
                  time: timeFormat(e.ts, 'yyyy-MM-dd HH:mm:ss'),
                  propName: productPropVo?.propName || '值',
                  valueTranslate: (productPropVo?.dataConstraint as { label: string; value: number; }[])?.find(ele => ele.value.toString() === e.value.toString())?.label || e.value
                }
              })
            } else {
              historyData.value = res
            }
          }).catch(err => {
          })  
        }
      } catch (err: unknown) {
      }
    }
    // 获取设备属性
    const getDeviceAttr = async (): Promise<void> => {
      try {
        const { productPropVoList } = await cubeDeviceCenterService.getNorthDeviceDetail({ deviceId, withPropertySpec: true })
        deviceAttrList.value = productPropVoList
        deviceOption.value = productPropVoList.map(item => {
          return {
            label: item.propName ?? '',
            value: item.propCode ?? '',
            dataType: item.dataType ?? ''
          }
        })
        if (deviceAttrList.value.length > 0) {
          currenAttr.value = deviceAttrList.value[0].propCode ?? ''
          currenAttrLabel.value = deviceAttrList.value[0].propName ?? ''
        }
        getHistoryList()
      } catch (err: unknown) {
      }
    }
 
    // 选时间
    const changeTime = (item: { value: string; name: string; }): void => {
      time.name = item.name
      time.value = item.value
      getHistoryList()
    }
    // 选设备属性
    const changeAttr = async (item: ProductPropVoList[]): Promise<void> => {
      currenAttr.value = item[0]?.propCode ?? ''
      currenAttrLabel.value = item[0]?.propName ?? ''
      getHistoryList()
    }
    onMounted(() => {
      getDeviceAttr()
    })
    const rank = (): VNode =>
      <div style={{ margin: '10px' }}>
        {historyData.value.length > 0
          ? <Rank 
            style={{ height: '94vh' }} 
            headStyle={{ background: '#1d66ff3b', color: 'black' }} 
            data={historyData.value as Record<string, string | number | boolean>[]} 
            head={[{ title: '采集时间', key: 'time' }, { title: '属性值', key: 'valueTranslate' }]}
          />
          : <Empty />}
          
      </div>
    const lineEchartDom = (): VNode => {
      const datalist: HistoryGroup[][] = Object.values(historyData.value)
      return (
        <div>
          { 
            datalist.length > 0 && datalist.map((item, index: number) =>
              <div key={index}>
                {
                  item && item.length > 0
                    ? <div class={styles['echart-title']}> <HistoryLineChart historyData={historyData.value} deviceData={deviceOption.value} /></div>
                    : <Empty />
                }
              </div>)
          }
        </div>
      )
    }
    const lineEchartDomE = (): VNode => {
      return (
        <div>
          {
            historyDataE.value
              ? <div class={styles['echart-title']} style={{ height: '300px' }}>  <HistoryLineChartE historyData={historyDataE.value} /></div>
              : <Empty />
          }
        </div>
      )
    }
    return (): JSX.Element => (
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <TimePicker style={{ justifyContent: 'flex-start' }} class={styles.time} onChange={changeTime} />
          <div class={styles.attr}>
            <div onClick={() => {
              showPicker.value = true 
            }} style={{ color: `${currenAttr.value ? '#646566' : '#100f0f37'}` }}>{currenAttrLabel.value || '请选择'}</div>
          </div>
          <Popup v-model:show={showPicker.value} round position='bottom'>
            <Picker
              columns={deviceAttrList.value} 
              onConfirm={({ selectedOptions }: { selectedOptions: ProductPropVoList[]; }) => {
                changeAttr(selectedOptions)
                showPicker.value = false
              }} 
              columns-field-names={{
                text: 'propName',
                value: 'propCode',
              }}
              onCancel={() => {
                showPicker.value = false
              }}
            />
          </Popup>
        </div>
        <div class={styles.content}>
          {
            !['string', 'boolean', 'enum'].includes(deviceAttrList.value?.find((e) => e.propCode === currenAttr.value)?.dataType ?? '')
              ? (!['ELECTRICMANAGE'].includes(applicationCode) ? lineEchartDom() : lineEchartDomE())
              : rank()
          }
        </div>
      </div>
    )
  },
})
