<template>
  <div class="panel">
    <SubPanelTemplate title="设备分类统计">
      <div class="appointment-data">
        <PlanPie :pieData="monitorSituationPieData">
          <img :src="getAssetsImage('business-icon/triage-queue-appointment.png')" />
        </PlanPie>
        <elevatorAnalysisList :contentList="monitorSituationPieData" style="margin-left: 10px;">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="照明回路实况" class="device-statistics">
      <div class="chart">
        <stackedBarChart :x-data="xData" :y-data="yData"></stackedBarChart>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率">
      <div class="alarm-event">
        <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import { getAssetsImage } from '@/utils/getImage';
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import { AlarmRateList } from '../public/types'
import { groupControlStat } from '@/api/device'

const { getEquipmentNumber } = useCommon()
const faultRate = ref<number>(0);
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; color:string;}[]>([
{
    name:'正常',
    data:[],
    color:'#2AE8BD'
  },  {
    name:'关闭',
    data:[],
    color:'#2989FF'
  },
])
const colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>(
    [
        { name: "门诊大厅屏", value: 30000, color: "#FFAB10" },
        { name: "电梯屏", value: 2000, color: "#2F8DFF" },
        { name: "候诊排队屏", value: 748, color: "#F14545" },
        { name: "病房走廊屏", value: 6000, color: "#19F8F7" },
        { name: "诊间门口频", value: 6000, color: "#2AE8BD" },
    ]
);
const getEquipmentInfo = async () => {
    monitorSituationPieData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
            name: item.genreName,
            value: item.num,
            color: colorList[index]
        })
    })
}
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
};
const getLightingCircuit =async () => {
 const res = await groupControlStat()
 yData.value[0].data.length = 0
 yData.value[1].data.length = 0
 xData.value = res.map(item=>{
  return item.groupName
 })
  res.forEach(item=>{
    item.detailStat.forEach(data=>{
      if (data.label === '开') {
        yData.value[0].data.push(data.num)
      }else{
        yData.value[1].data.push(data.num)
      }
    })
  })
}
onMounted(()=>{
  getEquipmentInfo()
  equipmentStatistic()
  getLightingCircuit()
})
</script>
<style lang="less" scoped>
.appointment-data {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.chart {
  height: 300px;
}

.alarm-event {
  display: flex;
  align-items: center;
  height: 300px;
  justify-content: space-around;
}
</style>