import { defineComponent, onMounted, ref, type PropType } from 'vue'
import '../device-info/device-info.less'
import { getDeviceAttribute, getDeviceType, getHistory } from '@/api'
import { Button } from 'vant'
import dayjs from 'dayjs'
import { Select } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { Line } from '@/components/charts/line'
/** 报表统计 */
export const History = defineComponent({
  props: {

    attributeVlaue: {
      default: {},
      type: Object as PropType<{
        pressure: number;
      }>,
    },

  },
  setup: () => {
    const route = useRoute()
    const { deviceId: id }: any = route.query

    const filterOption=ref([])
    const selectValue = ref<string[]>([])
    // const id: any = '1731931877726519296'
    const historyType = ref< 'day' | 'week' | 'month' | 'year'>('day')
    const historyList = ref<any>([])
    const historyData = ref<any>({
      deviceId: id,
      propCodes: '',
      startTs: 0,
      endTs: 0,
    })
    const arrtdata = ref<any>([])
    const tagCode = ['builtin.usage::ups', 'builtin.usage::battery', 'builtin.usage::temp', 'builtin.usage::fire', 'builtin.usage::liquid.level.sensors']
    const dataType = ref('')
    onMounted(async () => {
      // const { data } = await getDeviceType(id)
      const arrtlist: any = await getDeviceAttribute({ deviceId: id, withPropertySpec: true })
      arrtdata.value = arrtlist.productPropVoList
      // const type: string = data[id].tags[0].tagCode
      const datatype = await getDeviceType([id])
      tagCode.forEach(element => {
        datatype[id].tags.forEach((item) => {
          if (element === item.tagCode) {
            dataType.value = item.tagCode
          }
        })
      })
      historyData.value.propCodes = arrtlist.productPropVoList.length > 0 ? arrtlist.productPropVoList[0].propCode : ''
      selectValue.value = arrtlist.productPropVoList.length > 0 ? arrtlist.productPropVoList[0].propCode : []
      filterOption.value = arrtlist.productPropVoList

      // historyData.value.propCodes = code.value[dataType.value]

      dateChange('day')
      getData()
    })
    const getData = async (): Promise<void> => {
      const history = await getHistory(historyData.value)
      historyList.value = history
    }
    const selectChange = (): void => {
      if (selectValue.value.length > 0) {
        historyData.value.propCodes = selectValue.value.join(',')
      } else {
        selectValue.value = arrtdata.value[0].propCode
        historyData.value.propCodes = arrtdata.value[0].propCode
      }
      getData()
    }
    const dateChange = (type: 'day' | 'week' | 'month' | 'year'): void => {
      switch (type) {
        case 'day':
          historyType.value = type
          historyData.value.startTs = new Date(dayjs().format('YYYY-MM-DD 00:00:00')).getTime()
          historyData.value.endTs = new Date(dayjs().format('YYYY-MM-DD 23:59:59')).getTime()
          getData()
          break
        case 'week':
          historyType.value = type

          historyData.value.startTs = new Date(dayjs().startOf('week').format('YYYY-MM-DD 00:00:00')).getTime()
          historyData.value.endTs = new Date(dayjs().endOf('week').format('YYYY-MM-DD 23:59:59')).getTime()
          getData()
          break
        case 'month':
          historyType.value = type

          historyData.value.startTs = new Date(dayjs().startOf('month').format('YYYY-MM-DD 00:00:00')).getTime()
          historyData.value.endTs = new Date(dayjs().endOf('month').format('YYYY-MM-DD 23:59:59')).getTime()
          getData()
          break
        case 'year':
          historyType.value = type

          historyData.value.startTs = new Date(dayjs().startOf('year').format('YYYY-MM-DD 00:00:00')).getTime()
          historyData.value.endTs = new Date(dayjs().endOf('year').format('YYYY-MM-DD 23:59:59')).getTime()
          getData()
          break
      }
    }

    return () => (
      <div style='padding: 0 12px 100px;'>
        <div style='width:100%;display:flex;justify-content: space-between;margin-top:10px'>
          <Button type={historyType.value === 'day' ? 'primary' : 'default'} size='mini' onClick={() => { dateChange('day') }}>今日</Button>
          <Button type={historyType.value === 'week' ? 'primary' : 'default'} size='mini' onClick={() => { dateChange('week') }}>本周</Button>
          <Button type={historyType.value === 'month' ? 'primary' : 'default'} size='mini' onClick={() => { dateChange('month') }}>本月</Button>
          <Button type={historyType.value === 'year' ? 'primary' : 'default'} size='mini' onClick={() => { dateChange('year') }}>本年</Button>
          {/* <DatePicker> </DatePicker> */}
          <Select onChange={selectChange} v-model:value={selectValue.value} size='small' options={filterOption.value} style='width:200px' fieldNames={{ label: 'propName', value: 'propCode', options: 'children' }} mode='multiple' maxTagCount={1} notFoundContent='暂无数据' />
        </div>
        <Line historyData={historyList.value} deviceData={arrtdata.value} style='margin-top:10px;overflow-y: scroll;' />
      </div>
    )
  },
})
