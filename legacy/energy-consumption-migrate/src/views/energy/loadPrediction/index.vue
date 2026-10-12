<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <g-layout title="负荷预测" :show-search="false">
    <template #header-btn>
      <div class="flex justify-evenly">
        <Button
          v-for="item in getInstumenttype" :key="item.code" class="mr-5px" :type="item.code==currentInstumenttype?'primary':'default'"
          @click="setInstumenttype(item.code) "
        >
          {{ item.name }}
        </Button>
        <timeRadioGroup ref="TimeRadioGroupRef" v-model:value="data.period" show-range-picker @change="changeTime" />
      </div>
    </template>
    <template #content-table>
      <div class="">
        <div class="flex">
          <div class="w-15% bg-#fff tabs p-10px">
            <c-tree
              v-if="getInstumenttype.length>0"
              ref="ctree"
              :disabled="disabled"
              active-key="area" :instrument-type="currentInstumenttype"
              @area-click="areaClick" @route-click="routeClick"
              @all-list="allList"
            />
          </div>
          <div class="w-83% ml-15px">
            <!-- <div class=" flex  justify-around">
              <div
                v-for="item in dataStatistics"
                :key="item.id"
                class=" text-center mt-30px flex items-center"
              >
                <div>
                  <div class="font-400">{{ item.title }}</div>
                  <div class="font-900 mt-5px text-32px">{{ item.num }}</div>
                  <div class="my-10px text-12px color-#909cb0">
                    <span>
                      环比
                      <CaretUpFilled style="color:#00B80C" />
                      0.9%
                    </span>
                    <span>同比
                      <CaretDownOutlined />
                      0.9%
                    </span>
                  </div>
                </div>
                <div class="ml-10px"><img :src="item.image" alt=""></div>
              </div>
            </div> -->
            <c-layout title="负荷预测" class=" h-460px">
              <template #header-btn />
              <template #content>
                <div class="h-400px">
                  <e-bar
                    ref="ebaryn"
                    :legend="{
                      data:['用电量','预测值']
                    }"
                    :x-axis="{
                      type: 'category',
                      axisTick: {
                        alignWithLabel: true
                      },
                      data:data.period!==''?fhyx: data.timeFlag==='TODAY'? getHour():data.timeFlag=='THIS_MONTH'?getDays(): getMonth()
                    }"
                    name="单位：kwh"
                    :ydata="EnergyAnalysislist"
                  />
                </div>
              </template>
            </c-layout>
            <c-layout title="用能明细" class=" mt-15px ">
              <template #header-btn>
                <div class="flex justify-evenly">
                  <Button type="primary" @click="exportreport">导出报表</Button>
                  <!-- <Select class="w-167px" placeholder="能源分类" /> -->
                  <!-- <Weekicker /> -->
                </div>
              </template>
              <div class="flex justify-between ">
                <div class="w-50% h-84px  flex items-center justify-evenly " style="background: linear-gradient(51deg, #F7FAFF 0%, rgba(245,249,255,0.22) 37%, #F7FAFF 100%);">
                  <span>预测总能耗值:（kwh） <span class="font-900 text-32px">{{ fixedNum(Number(tabledata[0]?.predictedTotal)) }}</span></span>
                  <img :src="one" alt="">
                </div>
                <div class="w-50% h-84px flex items-center justify-evenly" style="background: linear-gradient(51deg, #F7FAFF 0%, rgba(245,249,255,0.22) 37%, #F7FAFF 100%);">
                  <span>历史总能耗值:（kwh） <span class="font-900 text-32px">{{ fixedNum(Number(tabledata[0]?.historicalTotal)) }}</span></span>
                  <img :src="two" alt="">
                </div>
              </div>
            </c-layout>
            <Table
              :pagination="false
              "
              :columns="columns" :data-source="tabledata" :scroll="{
                y:300
              }"
            />
          </div>
        </div>
      </div>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { MeterArea } from '@/api/dosageAnalysis'
import { LoadforecastionExport, LoadforecastionTrand } from '@/api/loadPrediction'
import CLayout from '@/components/common/cLayout.vue'
import GLayout from '@/components/common/gLayout.vue'
import EBar from '@/components/echart/eBar.vue'
import { fixedNum } from '@/utils/common'
import timeRadioGroup from '@/components/timeGroup.vue'
import { getDays, getHour, getMonth, xInfo } from '@/utils/getTime'
import { onMounted, reactive, ref, watch } from 'vue'

const ebaryn = ref()
const fhyx = ref([])
const one = new URL('@/assets/1.png', import.meta.url).href
const two = new URL('@/assets/2.png', import.meta.url).href
const getInstumenttype = ref<Array<{
  code:string; name:string;
}>>([])
const currentInstumenttype = ref<string>('')
const setInstumenttype = (code:string) => {

  currentInstumenttype.value = code
  getData()
  // getDosageAnalysis()
}
const disabled = ref(false)
const columns = ref([
  {
    title: '时间段',
    dataIndex: 'timeQuantum',
    key: 'timeQuantum'
  },
  {
    title: '预测值（kwh）',
    dataIndex: 'predictedValue',
    key: 'predictedValue'
  },
  {
    title: '历史值（kwh）',
    dataIndex: 'historicalValue',
    key: 'historicalValue'
  },
  {
    title: '偏差值（kwh）',
    dataIndex: 'deviationValue',
    key: 'deviationValue'
  },
  {
    title: '偏差百分比',
    dataIndex: 'deviationPercent',
    key: 'deviationPercent'
  }
])
const tabledata = ref<{
  timeFlag:string;
timeQuantum:
string;
predictedValue:
string;
historicalValue:
string;
deviationValue:
string;
deviationPercent:
string;
predictedTotal:
string;
historicalTotal:
string;
}[]>([])
const ctree = ref()
const data = reactive<{
  filterFlag: string;
  period:string;
  timeFlag: string;
  ids: string[];
  treeIds: any[];
  instrumentType: string;
}
>({
  period: '',
  filterFlag: '',
  timeFlag: 'TODAY',
  ids: [],
  treeIds: [],
  instrumentType: currentInstumenttype.value
})
const allList = (list:any) => {

  data.treeIds = list
}
watch(() => data.treeIds, () => {
  getData()
})
const areaClick = (value:string[], all:any) => {
  data.treeIds = all
  disabled.value = true
  getData()
}
const routeClick = (value:string[], all:any) => {
  data.treeIds = all
  disabled.value = true
  getData()
}
const EnergyAnalysislist = ref<echarts.SeriesOption[] >([])

const getData = async () => {
  data.filterFlag = ctree.value.activeKey

  data.instrumentType = currentInstumenttype.value
  // data.
  const { data: Loadtrand } = await LoadforecastionTrand(data)
  fhyx.value = xInfo(Loadtrand)
  disabled.value = false
  tabledata.value = Loadtrand
  const bardata:echarts.SeriesOption = {
    name: '用电量',
    barWidth: '20%',
    data: Loadtrand.map((res:{
      historicalValue:number;
    }) => {
      return res.historicalValue
    }),
    type: 'bar'
  }
  const updata:echarts.SeriesOption = {
    name: '预测值',

    data: Loadtrand.map((res:{predictedValue:number;}) => {
      return res.predictedValue
    }),
    type: 'line'
  }
  EnergyAnalysislist.value = []
  EnergyAnalysislist.value.push(bardata)
  EnergyAnalysislist.value.push(updata)
  ebaryn.value.render()
}

const changeTime = (value:string) => {
  data.timeFlag = value
  getData()
}
const exportreport = async () => {
  const { data: downloadRepole } = await LoadforecastionExport(data)
  const link = document.createElement('a')
  const blob = new Blob([downloadRepole], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '用能明细.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
onMounted(async () => {
  const { data: meterarea } = await MeterArea()
  getInstumenttype.value = meterarea.filter((res:{
    code:string;
  }) => res.code === 'electricity_meter')
  data.instrumentType = getInstumenttype.value[0].code
  currentInstumenttype.value = getInstumenttype.value[0].code
  setTimeout(() => {
    data.filterFlag = ctree.value.activeKey
  }, 100)
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

}
</style>
