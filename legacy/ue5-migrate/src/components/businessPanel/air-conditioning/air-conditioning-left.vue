<!-- 空调管理 -->
<template>
  <div>
    <SubPanelTemplate title="设备实时数据">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="devicesNum">
          <div class="content">
            <span>{{ devicesNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList @handelClickItemize="handelClickItemize" :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <DateInlineForm
        v-model:modelValue="trend"
        @search="alarmTrendInfo"
      ></DateInlineForm>
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
    <SubPanelTemplate title="设备报警率" class="alarm-event">
      <DateInlineForm
        v-model:modelValue="timeFrame"
        @search="equipmentAlarmRateInfo"
      ></DateInlineForm>
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
    <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"></modal-equipmentAll-table>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import pieList from "../public/pieList.vue";
import changeBar from "../public/changeBar.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from "../../hooks/useCommon";
import { ModelValueItf } from "../public/types";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import {
  alarmTrend,
  equipmentNumber,
  equipmentAlarmRateData,
} from "@/utils/requestData/alarm";
import { AlarmRate } from "@/api/models/alarm";
import { AlarmRateList } from "../public/types";
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()
let timer: any = ref(null);
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
let alarmRateData = reactive<AlarmRate>({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const deviceAllModalShow = ref<boolean>(false);
const deviceAllParameter = reactive({
  areaId:globalState.business.currentAreaId,
  tagCodes:[`custom.app::visual.${globalState.business.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
const trend = ref<ModelValueItf>();
let timeFrame = ref<ModelValueItf>();
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = reactive([
  { label: "报警", color: "#19F8F7", value: 0 },
  { label: "故障", color: "#FFC700", value: 0 },
  { label: "离线", color: "#EF424A", value: 0 },
]);
const devicesNum = ref(0);
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
const handelClickItemize = (item: {name: string; label: string; value: number;})=>{
  const statusType = item.label || item.name
  Object.assign(deviceAllParameter, {
    deviceState: statusType === '离线' ? false : statusType === '正常' ? true : undefined ,
  })
  deviceAllModalShow.value = true
}
let alarmStatusData = reactive([]);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

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

const { getEquipmentNumber } = useCommon();

// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.length = 0;
  devicesNum.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    devicesNum.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    roundPieData.push(obj);
  });
};
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
const init = () => {
  deviceDataInfo();
  equipmentAlarmRateInfo();
  alarmTrendInfo();
};
onMounted(() => {
  deviceDataInfo();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
  :deep(.pie-box){
    width: 200px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 140px;
  display: flex;
}

.iconOutlined {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #cbe2ff;
}

.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}

.downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }
:deep(.deviceList){
  flex-direction: column;
}
</style>
