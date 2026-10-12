<template>
  <SubPanelTemplate title="人员出入情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
    <div class="echart">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '人次' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { inOutTrend } from "@/api/door";


const colorList = ['#2AE8BD', '#2989FF']
const alarmStatusData = ref([
  {alarmStatus: "0", alarmStatusName: "进入", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "1", alarmStatusName: "离开", alarmNum: 0, color: 'rgb(0, 242, 123)'},
]);
const titles = ref<string[]>([])
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '进入',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: colorList[0],
    linearGradientColor: colorList
  },
  {
    name: '离开',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: colorList[1],
    linearGradientColor: colorList
  },
])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const getTemplateData = async ()=>{
  const res = await inOutTrend({type: trendTime.value.timeType, period: trendTime.value.dateRange.join(",")})
  
  alarmStatusData.value[0].alarmNum = res.inTotal
  alarmStatusData.value[1].alarmNum = res.outTotal
  xData.value = res.xtitle
  yData.value[0].data = res.xtitle.map(xItem=>{
    return res.inTrend.find(item=>item.timeValue===xItem)?res.inTrend.find(item=>item.timeValue===xItem).num:0
  })
  yData.value[1].data = res.xtitle.map(xItem=>{
    return res.outTrend.find(item=>item.timeValue===xItem)?res.outTrend.find(item=>item.timeValue===xItem).num:0
  })
}




</script>
<style scoped lang="less">
// 单个模块统计样式
:deep(.ant-statistic) {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

:deep(.ant-statistic-title) {
  white-space: nowrap;
  margin-bottom: 0;
}

:deep(.ant-statistic-content) {
  font-size: 14px !important;
  padding-left: 0 !important;
}

:deep(.grid-container) {
  display: flex;
  width: 100%;
}

:deep(.grid-item) {
  flex: 1;
}

.echart {
  height: 220px;
}
</style>