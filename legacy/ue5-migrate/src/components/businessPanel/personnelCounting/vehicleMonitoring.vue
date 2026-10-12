<template>
  <div>
    <SubPanelTemplate title="来访趋势">
      <template #extra> 
        <DateInlineForm v-model:modelValue="energyOverviewTime" @search="changeHandleEnergyOverviewTime">
        </DateInlineForm>
      </template>
      <div class="echart">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
          :unit="{ x: '', y: '人次' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="事由分类">
      <template #extra> 
        <DateInlineForm v-model:modelValue="overviewTime" @search="changeOverviewTime">
        </DateInlineForm>
      </template>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie :pieData="pieData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="检测记录">
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { ModelValueItf } from '@/components/businessPanel/public/types'
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { bottomMonitorRecordPage, statisticsReasonTread, statisticsReasonType } from '@/api/park-management'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import dayjs from "dayjs";

const energyOverviewTime = ref<ModelValueItf>()
const overviewTime = ref<ModelValueItf>()
const columns = ref([
  {
    title: "车牌号",
    dataIndex: "vehicleNo",
  },
  {
    title: "来访事由名称",
    dataIndex: "reason",
  },
  {
    title: "出入时间",
    dataIndex: "accessTime",
  },
]);
const data = ref<any>([]);
const pieData = ref([])
const alarmTotal = ref(0)
const xData = ref<string[]>([])
const titles = ['进','出']
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '进',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: '#2989FF',
    linearGradientColor: ['#2989FF']
  },
  {
    name: '出',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: '#FFC700',
    linearGradientColor: ['#FFC700']
  },
])
const changeHandleEnergyOverviewTime = async ()=>{
  const accessIn = await statisticsReasonTread({
    type:energyOverviewTime.value.timeType,
    period: energyOverviewTime.value.dateRange.join(','),
    accessType:'ACCESS_IN'
  })
  const accessOut = await statisticsReasonTread({
    type:energyOverviewTime.value.timeType,
    period: energyOverviewTime.value.dateRange.join(','),
    accessType:'ACCESS_OUT'
  })
  xData.value = accessIn.map(e=>e.period)
  yData.value[0].data = accessIn.map(e=>e.num)
  yData.value[1].data = accessOut.map(e=>e.num)

}
const changeOverviewTime = async ()=>{
  const res = await statisticsReasonType({
    type:overviewTime.value.timeType,
    period: overviewTime.value.dateRange.join(','),
  })
const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
alarmTotal.value = 0
  pieData.value = res.map((e,i)=>{
    alarmTotal.value += e.num
    return {
      name:e.reasonName,
      value:e.num,
      color:colors[i]
    }
  })
}
const getBottomMonitorRecordPage = async ()=>{
  const res = await bottomMonitorRecordPage({
    pageSize:50,
    pageNumber:1
  })
  data.value = res.records.map(e=>{
    return {
      ...e,
      accessTime:dayjs(e.accessTime).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
onMounted(()=>{
  getBottomMonitorRecordPage()
})
</script>
<style lang="less" scoped>
.chart{
  height: 280px;
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
  .chart{
  width: 220px;
  height: 220px;
}
}
.echart{
  height: 280px;
}
</style>