<template>
  <div class="panel">
    <SubPanelTemplate title="新风系统设备状态分布">
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
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
      </template>
      <OperateDays :value="alarmNum" title="报警总数">
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
        </div>
      </OperateDays>
      <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
      <LineChart class="charts" :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警率" >
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarm"
          @search="equipmentAlarm"
        ></DateInlineForm>
      </template>
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="alarmData"
          unit="%"
          bgColor="#2989FF"
          color="#2989FF"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { equipmentTotal } from '@/api/equipment'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { alarmTrend, equipmentAlarmRateData, equipmentNumber } from '@/utils/requestData/alarm'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import { statusNum } from '@/api/securitymanagement'
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const trend = ref<ModelValueItf>();
const barXData = ref<string[]>(['1号楼','2号楼','3号楼'])
const barYData = ref<{name:string; data: number[]; color:string;}[]>([
{
    name:'正常',
    data:[1,2,3,4],
    color: '#2AE8BD'
    
  },  {
    name:'离线',
    data:[1,2,3,4],
    color: '#2989FF'
  },
])
let alarm = reactive<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "报警设备总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
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
let alarmData = ref(0);
const alarmTotal = ref(0)
const pieData = ref([]);
let alarmStatusData = reactive([]);
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
// 设备报警率
const equipmentAlarm = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: alarm.dateRange.join(","),
    type: alarm.timeType,
  };
  let res = await equipmentAlarmRateData(param);
  alarmData.value = Math.round(Number(res.proportion) * 10000) / 100.0;
  dataList[0].value = Number(res.deviceTotal);
  dataList[1].value = Number(res.alarmNum);
  dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
};
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
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
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData = data.alarmStatusStatistics;
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
const getStatusNum = async () => {
  const res = await statusNum()
  barXData.value = res.areaStatusNum.map(item=>{
    return item.areaName
  })
  barYData.value[0].data = res.areaStatusNum.map(item=>{
    return item.onNum
  })
  barYData.value[1].data = res.areaStatusNum.map(item=>{
    return item.offlineNum
  })
}
onMounted(()=>{
  deviceDataInfo()
  getStatusNum()
})
</script>
<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
.charts {
  height: 230px;
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0 30px;
}
</style>