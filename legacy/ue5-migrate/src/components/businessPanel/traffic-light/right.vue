<template>
  <div >
    <SubPanelTemplate title="设备报警级别" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmLevelTime" @search="changeAlarmLevelTime"></DateInlineForm>
      </template>
      <GridContainer :data="levelStatistic"></GridContainer>
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="total-num">{{ levelAlarmTotal }}</div>
            <div>报警总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="trend"
        @search="alarmTrendInfo"
        ></DateInlineForm>
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
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="faultRate"
          unit="%"
          bgColor="#FFC700"
          color="#FFC700"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "../public/lineChart.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import useCommon from '@/components/hooks/useCommon'
import { alarmTrend, equipmentNumber } from '@/utils/requestData/alarm'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()

const {
  getAlarmLevel,
  getEquipmentNumber
} = useCommon();
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
const faultRate = ref<number>(0);
const alarmLevelTime = ref<ModelValueItf>()
const trend = ref<ModelValueItf>();
const chainRatio = ref<number>(0);
const alarmNum = ref<number>(0);
const levelPieData = ref([])
let alarmStatusData = reactive([]);
const levelAlarmTotal = ref(0)
const levelStatistic = ref([
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '一级',
    color: '#FFC700'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '二级',
    color: '#74AEE7'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '三级',
    color: '#00F27B'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '四级',
    color: '#29C2FF'
  },
]);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
// 报警级别
const changeAlarmLevelTime =async ()=>{
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmLevelTime.value.dateRange.join(","),
    type: alarmLevelTime.value.timeType,
  };
levelPieData.value.length = 0
levelAlarmTotal.value = 0
 const res = await getAlarmLevel(param);
 res.forEach((item,index)=>{
  levelAlarmTotal.value+=item.alarmNum
  levelStatistic.value[index].alarmNum = item.alarmNum
  levelPieData.value.push({
    label:item.name,
    value:item.alarmNum,
    color:levelStatistic.value[index].color
  })
 })
}
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
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
onMounted(()=>{
  equipmentStatistic()
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
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
</style>