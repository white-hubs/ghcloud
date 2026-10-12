<!-- 给排水 -->
<template>
  <div class="panel">
    <SubPanelTemplate title="设备实时数据">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div> 
        </RoundPie>
        <pieList @handelClickItemize="handelClickItemize" :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="trend" @search="getAlarmTrend"></DateInlineForm>
      </template>
      <OperateDays :value="alarmInfo.total" title="报警总数">
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', alarmInfo.chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[alarmInfo.chainRatio > 0 ? 'up' : 'down']">
            {{ alarmInfo.chainRatio + "%" }}
          </div>
        </div>
      </OperateDays>
      <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
      <LineChart :x-data="xData.arr" :series="series"></LineChart>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警率" class="alarm-event">
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
    <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"></modal-equipmentAll-table>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import OperateDays from "../public/operateDays.vue";
import pieList from "../public/pieList.vue";
import changeBar from "../public/changeBar.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from "../../hooks/useCommon";
import { ModelValueItf, pieType } from "../public/types";
import enumeratie from "../../../utils/enumeratie";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { AlarmRateList } from "../public/types";
import { AlarmStatusData } from "@/api/models/alarm";
import { alarmTrend, equipmentAlarmRateData } from "../../../utils/requestData/alarm";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
const { alarmStatusOptions } = enumeratie();
const {
  getEquipmentNumber,
  getAlarmsNumber,
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();
let timer: any = ref(null);
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const deviceAllModalShow = ref<boolean>(false);
let trend = reactive<ModelValueItf>({
timeType: 'THIS_YEAR',
dateRange: []
});
const deviceAllParameter = reactive({
  areaId:piniaStoreArea.currentAreaId,
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
let alarm = reactive<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
let alarmData = ref(0);
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = reactive<pieType[]>([]);
const eventNum = ref<number>();
const alarmStatusData = reactive([]);
const alarmInfo = reactive({
  total: 0,
  chainRatio: 0,
});
const xData = reactive({ arr: [] });
const series = reactive([
  {
    data: [],
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
const handelClickItemize = ()=>{
  deviceAllModalShow.value = true
}
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 设备实时数据
const getEquipmentData = async () => {
  let res: any = await getEquipmentNumber();
  roundPieData.length = 0;
  res.deviceStatusNums &&
    res.deviceStatusNums.forEach((item, index) => {
      roundPieData.push({
        label: `${deviceStatusType[item.name]}(${
          Math.round((item.num / res.deviceNum) * 10000) / 100.0
        }%)`,
        value: item.num,
        color: colorList[index],
      });
    });
  eventNum.value = res.deviceNum;
};
// 设备报警趋势
const getAlarmTrend = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.dateRange.join(","),
    type: trend.timeType,
  };
  let res: any = await getAlarmsNumber(param);
  let data: any = await alarmTrend(param);
  xData.arr = data.xdata;
  series[0].data = data.ydata;
  alarmStatusData.length = 0;
  res.alarmStatusStatistics.forEach((item) => {
    let obj = {
      alarmStatusName: item.alarmStatusName,
      alarmNum: item.alarmNum,
      color: "",
    };
    alarmStatusOptions.value.forEach((element) => {
      if (item.alarmStatus === element.value) {
        obj.color = element.color;
      }
    });
    alarmStatusData.push(obj);
  });
  alarmInfo.total = res.count;
  alarmInfo.chainRatio = res.ratio;
};
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

const init = () => {
  getEquipmentData();
  equipmentAlarm();
  getAlarmTrend();
};
onMounted(() => {
  init();
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
  padding: 10px 10px 0 30px;
}
</style>
