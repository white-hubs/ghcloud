<template>
  <div class="panel">
    <SubPanelTemplate title="当前应急物资情况统计">
      <div class="charts">
        <stackedColumn :unit="'件'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="应急物资在库统计">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="devicesNum">
        </RoundPie>
        <pieList :roundPieData="roundPieData1"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="应急资金趋势统计">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="timeFrame"
        @search="getAlarmLevel"
        ></DateInlineForm>
      </template>
      <div class="charts">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="['支出','进账']" gridTop="15"
          :unit="{ x: '', y: '元' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import stackedColumn from "../public/charts/stacked-column/stackedColumn.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { emergencyRecordTrend, emergencySuppliesStock } from '@/api/emergency'

const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name:'入库数量',
      data:[]
    },{
      name:'出库数量',
      data:[]
    },
  ],
})
let timeFrame = ref<ModelValueItf>();
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = ref([
  {
    value:10,
    label:'生活物资',
    color:"#328BF7"
  },
  {
    value:10,
    label:'医疗物资',
    color:"#19F8F7"
  },
  {
    value:10,
    label:'救援物资',
    color:"#FFC700"
  },
  {
    value:10,
    label:'能耗物资',
    color:"#EF424A"
  },
]);
const roundPieData1 = ref([])
const xData = ref<string[]>(['1','2','3','4','5','6'])
const yData = ref([
 {
  data: ['1','2','3','4','5','6'],
   linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
   name:'支出'
  },
 {
  data: ['1','2','3','4','5','6'],
  linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)',
  name:'进账'
  },
])
const devicesNum = ref(0);
const getAlarmLevel = async ()=> {
 const res = await emergencyRecordTrend({type:timeFrame.value.timeType,period:timeFrame.value.dateRange.join(",")})
 xData.value=res.map(item => {
        if (timeFrame.value.timeType === 'TODAY') {
            return item.day += '时'
        } else if (timeFrame.value.timeType === 'THIS_YEAR') {
            return item.day += '月'
        } else {
            return item.day
        }
    });
    yData.value[0].data = res.map(item => item.outAmount)
    yData.value[1].data = res.map(item => item.inAmount)
}
const getMaterialStatistics =async () => {
  const res =  await emergencySuppliesStock()
  buildUtilization.xData = res.map(e=>e.name)
  buildUtilization.yData[0].data = res.map(e=>e.inValue)
  buildUtilization.yData[1].data = res.map(e=>e.outValue)
  roundPieData.value = res.map((item,index)=>{
   return {
    value:item.percentage,
    label:item.name,
    color:colorList[index]
   }
  })
  roundPieData1.value = res.map((item,index)=>{
   return {
    value:item.percentage + '%',
    label:item.name,
    color:colorList[index]
   }
  })
    
  }
onMounted(() => {
  getMaterialStatistics()
})
</script>
<style lang="less" scoped>
.charts {
  height: 240px;
}
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
  .policeList{
    height: auto;
  }
}
</style>