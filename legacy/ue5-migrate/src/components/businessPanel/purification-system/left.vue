<template>
  <SubPanelTemplate title="设备状态分布">
    <div >
      <div class="flex-between">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="roundPieData"></PieList>
      </div>
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
      <div class="chart">
        <LineChart :x-data="xData" :series="series" :title="'次'"></LineChart>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警率" class="alarm-event">
    <template #extra>
      <DateInlineForm
        v-model:modelValue="timeFrame"
        @search="equipmentAlarmRateInfo"
      ></DateInlineForm>
    </template>
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="alarmRateData.proportion"
          unit="%"
          bgColor="#2989FF"
          color="#2989FF"
        >
        </waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import useCommon from '@/components/hooks/useCommon'
import { AlarmRateList, ModelValueItf } from '../public/types'
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import LineChart from "../public/lineChart.vue";
import deviceModule from "../public/deviceModule.vue";
import { AlarmRate } from "@/api/models/alarm";
import { alarmTrend, equipmentAlarmRateData, equipmentNumber } from '@/utils/requestData/alarm'
import { useStateStore } from '@/pages/state/use-state-store';
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const { globalState } = useStateStore()
const { getEquipmentNumber } = useCommon();
const timeFrame = ref<ModelValueItf>();
const trend = ref<ModelValueItf>();
const roundPieData = ref([]);
const alarmTotal = ref(0)
const alarmRateData = reactive<AlarmRate>({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const alarmStatusData = reactive([]);
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
// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colors[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const xData = ref(["1时", "2时", "3时", "4时", "5时"]);
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
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
  Object.assign(alarmStatusData,data.alarmStatusStatistics)
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.value = res.xdata;
  series[0].data = res.ydata;
};
// 设备报警率
const equipmentAlarmRateInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await equipmentAlarmRateData(param);
  alarmRateData.proportion = Math.round(Number(res.proportion) * 10000) / 100.0;
  dataList[0].value = Number(res.deviceTotal);
  dataList[1].value = Number(res.alarmNum);
  dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
};
onMounted(()=>{
  deviceDataInfo()
  equipmentAlarmRateInfo()
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
.chart{
  height: 250px;
}
.equipmentInfo{
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 300px;
}
</style>