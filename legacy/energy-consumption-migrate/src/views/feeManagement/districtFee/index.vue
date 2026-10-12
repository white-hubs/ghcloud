<template>
  <g-layout title="分区费用" :show-search="false">
    <template #content-table>
      <div class="flex">
        <div class="w-278px bg-#fff tabs p-10px">
          <TreeSearch v-model:value="checkedKeys" :tabs="tabs" @tab-change="tabChange" @checkClick="checkClick" />
        </div>
        <div class="ml-15px" style="width: calc(100% - 278px);">
          <CLayout :title="'用'+areaTitle+'费用统计'">
            <template #header-btn>
              <timeRadioGroup  showRangePicker v-model:value="qoqPeriod" @change="(flag: string)=>queryQoq(flag)" />
            </template>
            <template #content>
              <Spin :spinning="qoqLoading">
                <div class="flex justify-around  " style="min-height:60px">
                  <div v-for="item in qoqData" :key="item.id" class="text-center mt-15px flex items-center mult mult-wrap ">
                    <div class="font-400 color-#646566">{{ item.title }}</div>
                    <div class="mult-bootom">
                      <div class="font-700 mt-5px text-32px">{{ fixedNum(item.amount || 0) }}</div>
                      <div class="my-10px ml-10px text-12px color-#979899">
                        <span>环比
                          <CaretDownOutlined v-if="Number(item.qoq) < 0" class="ml-3px" />
                          <CaretUpFilled v-else style="color:#00B80C" class="ml-3px" />
                          {{ item.qoq || 0 }}% </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Spin>
            </template>
          </CLayout>

          <FeeLine
            ref="feeLineRef" :title="areaTitle+'费趋势'" class=" mt-15px h-460px" :checked-keys="checkedKeys"
            :instrument-type="instrumentType"
            :treeids="selectInfo"
          />

          <c-layout :title="areaTitle+'费明细'" class=" mt-15px">
            <template #header-btn>
              <Button type="primary" class="ml-15px" :loading="exportLoading" @click="exportHandle">导出报表</Button>
            </template>
            <template #content>
              <div class="flex_top">
                <span class="desc">单位：元</span>
                <timeRadioGroup v-model:value="areaPeriod" show-range-picker @change="(flag: string)=>queryArea(flag)" />
              </div>
              <div id="myTable h-460px">
                <Spin :spinning="areaLoading">
                  <Table
                    :pagination="false"
                    :columns="instrumentType === 'water_meter'? waterColumns : instrumentType === 'gas_meter' ? gasColumns : columns" :data-source="areaData" :scroll="{y:scrollY }"
                  />
                </Spin>
              </div>
            </template>
          </c-layout>
        </div>
      </div>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { areaExcel, getChargeArea, getChargeAreaQoq } from '@/api/feeManage'
import { EnergyGateList } from '@/api/loadPrediction'
import { fixedNum } from '@/utils/common'
import timeRadioGroup from '@/components/timeRadioGroup.vue'
import { type TableColumnsType } from 'ant-design-vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import FeeLine from './components/FeeLine.vue'
import TreeSearch from './components/TreeSearch.vue'

const scrollY = ref<number>(0)
const tabs = ref({
  list: [
    { key: 'electricity_meter', name: '电' },
    { key: 'water_meter', name: '水' },
    { key: 'gas_meter', name: '燃气' }
  ],
  activeKey: 'electricity_meter'
})
// Tree 选中的区域
const checkedKeys = ref<(string | number)[]>([])
const instrumentType = ref<string>(tabs.value.activeKey)
const tabChange = (activeKey: string) => {

  instrumentType.value = activeKey
  // queryAll()
}
// 环比
const qoqLoading = ref<boolean>(false)
const qoqPeriod = ref('')
const qoqTimeFlag = ref('TODAY')
const qoqData = ref<{ title: string; amount?: number|undefined;qoq?: number| undefined; id: string;}[]>([
  {
    id: 'amount',
    title: '总用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'fvAmount',
    title: '峰用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'pvAmount',
    title: '平用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'gvAmount',
    title: '谷用电（元）',
    amount: 0,
    qoq: 0
  }
])
const selectInfo = ref<any>([])
const checkClick = (data:any) => {
  selectInfo.value = []
  selectInfo.value = data
  queryArea(areaTimeFlag.value)
}
const feeLineRef = ref()
// 用能明细
const areaLoading = ref(false)
const areaPeriod = ref('')
const areaTimeFlag = ref('TODAY')
const areaData = ref([])
const columns: TableColumnsType = [
  {
    title: '区域名称',
    dataIndex: 'projectName',
    key: 'projectName',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '总电费（元）',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '峰电费（元）',
    dataIndex: 'fvAmount',
    key: 'fvAmount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '平电费（元）',
    dataIndex: 'pvAmount',
    key: 'pvAmount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '谷电费（元）',
    dataIndex: 'gvAmount',
    key: 'gvAmount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  }
]
const waterColumns: TableColumnsType = [
  {
    title: '区域名称',
    dataIndex: 'projectName',
    key: 'projectName',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '水费（元）',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  }
]
const gasColumns: TableColumnsType = [
  {
    title: '区域名称',
    dataIndex: 'projectName',
    key: 'projectName',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  },
  {
    title: '燃气费（元）',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => {
      return text === null ? '-' : text
    }
  }
]
const getTypeName = (type: string) => {
  let name = ''
  switch (type) {
    case 'water_meter':
      name = '水'
      break
    case 'electricity_meter':
      name = '电'
      break
    case 'gas_meter':
      name = '燃气'
      break
    case 'vapour':
      name = '热力'
      break
    default:
      break
  }
  return name
}
// 查询环比
const queryQoq = async (timeTypeStr?:string) => {
  qoqLoading.value = true
  try {
    const ids = checkedKeys.value.join(',')
    qoqLoading.value=false
    if (timeTypeStr) qoqTimeFlag.value = timeTypeStr
    
if(selectInfo.value.length==0){

  qoqData.value = [
            {
              id: 'amount',
              title: instrumentType.value === 'gas_meter' ? '总燃气费（元）': instrumentType.value=='vapour'?'总蒸汽费':'',
              amount:0,
              qoq:0
            }
          ]

  return
}else{
  qoqData.value=[
  {
    id: 'amount',
    title: '总用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'fvAmount',
    title: '峰用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'pvAmount',
    title: '平用电（元）',
    amount: 0,
    qoq: 0
  },
  {
    id: 'gvAmount',
    title: '谷用电（元）',
    amount: 0,
    qoq: 0
  }
]
}
    getChargeAreaQoq({ filterFlag:'area',treeIds: selectInfo.value, instrumentType: instrumentType.value, areaIds: ids, timeFlag: qoqTimeFlag.value ,period:qoqPeriod.value}).then(result => {
      if (result.data) {
        const { amount, amountQoQ, fvAmount, fvAmountQoQ, pvAmount, pvAmountQoQ, gvAmount, gvAmountQoQ } = result.data
        if (instrumentType.value === 'electricity_meter') {
          qoqData.value[0].amount = amount || 0
          qoqData.value[0].qoq = amountQoQ || 0
          qoqData.value[1].amount = fvAmount || 0
          qoqData.value[1].qoq = fvAmountQoQ || 0
          qoqData.value[2].amount = pvAmount || 0
          qoqData.value[2].qoq = pvAmountQoQ || 0
          qoqData.value[3].amount = gvAmount || 0
          qoqData.value[3].qoq = gvAmountQoQ || 0
        }
        if (['water_meter', 'gas_meter'].includes(instrumentType.value)) {
          qoqData.value = [
            {
              id: 'amount',
              title: instrumentType.value === 'water_meter' ? '总水费（元）' : '总燃气费（元）',
              amount,
              qoq: amountQoQ
            }
          ]
        }
        qoqLoading.value = false
      }
    })
  } catch (error) {
    // message.error(error.data?.message || '服务器异常，请稍后重试')
    qoqLoading.value = false
  }
}
// 查询用能明细
const queryArea = async (timeTypeStr:string) => {
  areaLoading.value = true
  try {
    const ids = checkedKeys.value.join(',')
    areaTimeFlag.value = timeTypeStr
    const data = {filterFlag:'area', instrumentType: instrumentType.value, areaIds: ids, timeFlag: areaTimeFlag.value, treeIds: selectInfo.value, period: areaPeriod.value }
if(selectInfo.value.length==0){
  areaLoading.value = true
  return
}
    getChargeArea(data).then(result => {
      areaData.value = result.data || []
      areaLoading.value = false
    })
  } catch (error) {
    // message.error(error.data?.message || '服务器异常，请稍后重试')
    areaLoading.value = false
  }
}
// 导出
const exportLoading = ref(false)
const exportHandle = async () => {
  exportLoading.value = true
  try {
    const ids = checkedKeys.value.join(',')
    const { data } = await areaExcel({filterFlag:'area', instrumentType: instrumentType.value, areaIds: ids, timeFlag: areaTimeFlag.value, treeIds: selectInfo.value, period: areaPeriod.value })
    exportLoading.value = false
    const link = document.createElement('a')
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', areaTitle.value + '费明细.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    // message.error(error.data?.message || '服务器异常，请稍后重试')
    exportLoading.value = false
  }
}
const queryAll = async () => {
  try {
    queryQoq()
    queryArea(areaTimeFlag.value)
    nextTick(() => {
      feeLineRef.value.queryTrend()
    })
  } catch (error) {
    // message.error(error.data?.message || '服务器异常，请稍后重试')
  }
}
// 查询环比
watch(() => checkedKeys.value, (value) => {
  queryAll()
})

const areaTitle = computed(() => {
  return getTypeName(instrumentType.value)
})

const scrollHandle = () => {
  let tableHeight = 500
  const clientHeight:number|undefined = document.getElementById('myTable')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight
  }
  scrollY.value = tableHeight
}
// 获取能耗配置
const queryConfig = async () => {
  const { data } = await EnergyGateList()
  const tabListback = [...tabs.value.list]
  const tabList: { key: string; name: string; }[] = []
  data.forEach((item: { open: boolean; energyType: string; }) => {
    if (item.open) {
      tabList.push({
        key: item.energyType,
        name: getTypeName(item.energyType)
      })
    }
  })
  tabs.value.list = tabList
}
// 页面加载
onMounted(() => {
  queryConfig()
  // 设置表格滚动
  scrollHandle()
  window.addEventListener('resize', function () {
    scrollHandle()
  })
})

</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
.layout-container{
  background-color: #f0f2f5 !important;
}
.tabs{
  :deep(.template-tabs-tab){
    width: 50%;
    justify-content: center;

  }

  :deep(.template-tabs-nav-list){
  width: 99%;
}
}
:deep(.content-right) {
  background-color: #f3f3f3;
  // .dataStatistics {
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   border-radius: 10px;
  //   padding: 15px;
  //   box-sizing: border-box;
  //   // background-color: red;
  //   // .Statistics {
  //   //   background-color: #fafafa;
  //   //   height: 120px;
  //   //   width: 200px;
  //   //   padding: 30px;
  //   //   box-sizing: border-box;
  //   //   .name{
  //   //     font-weight: bold;
  //   //   }
  //   //   .num{
  //   //     font-size: 18px;
  //   //     font-weight: bold;
  //   //     margin-top: 15px;

  //   //   }
  //   // }
  // }
}
.flex-row{
  flex-direction: row;
}
.flex-column{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.no-wrap{
  white-space: nowrap;
}
.mult{
  flex:1;
  &:last-of-type{
    &::after{
      display: none;
    }
  }
}
.mult-wrap{
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  &::after{
    content: '';
    display: inline-block;
    width: 1px;
    height: 40px;
    border-right: 1px dashed #D8D8D8;
    position: absolute;
    top: 50%;
    right:0;
    transform: translateY(-50%);
  }
}
.mult-bootom{
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
}
.flex_top{
  display: flex;
  justify-content: space-between;
  padding: 15px;
  align-items: center;
  color:#86909C;
  font-size: 12px;
}
.bg_white{
  background: #fff;
}
</style>
