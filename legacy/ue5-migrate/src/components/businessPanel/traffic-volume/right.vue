<template>
  <div >
    <SubPanelTemplate title="隧道不同车道车流量分析">
      <template #extra>
        <DateInlineForm v-model:modelValue="equipmentAlarmTime" @search="changeHandleEquipmentAlarmTime">
        </DateInlineForm>
      </template>
      <div class="charts">
        <stackedColumn :unit="'辆'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
      </div>
      <div class="footer">
          <RollTable
            :column="column"
            :data="listData"
          >
          </RollTable>
        </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="断面实时平均车速分析">
      <div class="charts">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
          :unit="{ x: '', y: '人次' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备状态分布">
      <div class="flex-between">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="pieData"></PieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import PieList from "../public/pieList.vue";
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../public/types'
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import stackedColumn from "../public/charts/stacked-column/stackedColumn.vue";
import { equipmentTotal } from '@/api/equipment'
import { differentTunnels, speedAnalysis } from '@/api/securitymanagement'
import moment from 'moment'
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()
const equipmentAlarmTime = ref<ModelValueItf>()
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name:'驶入',
      data:[]
    },{
      name:'驶出',
      data:[]
    },
  ],
})
let listData = reactive([]);
const column = reactive([
  {
    title: "车道",
    dataIndex: "lane",
    width: 120,
  },
  {
    title: "驶入数量",
    dataIndex: "inNum",
  },
  {
    title: "驶出数量",
    dataIndex: "outNum",
  }
]);
const alarmTotal = ref(0)
const pieData = ref([]);
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
{
  data: [0],
   linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
   name:'进入'
  },
 {
  data: [0],
  linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)',
  name:'离开'
  },
])
const titles = ref<string[]>([])
  const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
const changeHandleEquipmentAlarmTime = async() => {
  const params = {
    type:equipmentAlarmTime.value.timeType,
    period:equipmentAlarmTime.value.dateRange.join(",")
  }
    const res = await differentTunnels(params);
    buildUtilization.xData = res.map(e=>e.lane)
    buildUtilization.yData[0].data = res.map(e=>e.inNum)
    buildUtilization.yData[1].data = res.map(e=>e.outNum)
    Object.assign(listData,res)
}
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    pieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
    });
};
const getSpeedAnalysis =async () => {
const res = await speedAnalysis({period:[moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(",")})
xData.value = res.xtitle.map(item => {
     return item+'时'
  });
yData.value[0].data = res.xtitle.map(xItem=>{
      return res.realAverageSpeedAnalysisIn.find(item=>item.timeFlag===xItem)?res.realAverageSpeedAnalysisIn.find(item=>item.timeFlag===xItem).speed:0
  })
yData.value[1].data = res.xtitle.map(xItem=>{
        return res.realAverageSpeedAnalysisOut.find(item=>item.timeFlag===xItem)?res.realAverageSpeedAnalysisOut.find(item=>item.timeFlag===xItem).speed:0
  })
}
onMounted(()=>{
  deviceDataInfo()
  getSpeedAnalysis()
})
</script>
<style lang="less" scoped>
.charts {
  height: 240px;
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
</style>