<template>
  <div class="panel">
    <SubPanelTemplate title="报警设备top5">
      <div class="header">
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </div>
      <div class="body" style="min-height: 250px" v-show="alarmRank.list.length > 0">
        <EventAlarmItem v-for="(item, index) in alarmRank.list" :key="item.id" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 150px" v-show="alarmRank.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="动环报警">
      <div class="header">
        <DateInlineForm v-model:modelValue="timeFrame" @search="changeTimeFrame" />
      </div>
      <div class="body">
        <OperateDays title="报警数" :value="alarmCon.count" class="body-bum alarm-num">
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
          </div>
        </OperateDays>
        <GridContainer :data="alarmStatusData"></GridContainer>
        <RollTable :column="column" :data="data" class="roll-table" @click-row="handelClickRow" :limitScrollNum="6">
          <template #alarmStatus="{ record }">
            <span :style="{ color: statusStyle(record.alarmStatus).color }">{{
              statusStyle(record.alarmStatus).label
            }}</span>
          </template>
          <template #alarmLevelCode="{ record }">
            <span :style="{ color: leaveStyle(record.alarmLevelCode).color }">{{
              leaveStyle(record.alarmLevelCode).label
            }}</span>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import LineChart from "../public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import moment from "moment";
import enumeratie from "@/utils/enumeratie";
import { ModelValueItf } from "../public/types";
import { storeArea } from "@/piniaStore/area";
import { AlarmAreaTop, AlarmStatus } from "@/api/models/alarm";
import { statisticsDeviceTop, statisticsStatus, alarmStatisticsList } from "@/api/alarm";
import { storeMenu } from "@/piniaStore/menu";
import bus from "@/utils/bus";
const piniaStoreMenu = storeMenu();
interface AlarmHandlType {
  list: AlarmAreaTop[];
}
let handleTime = ref<ModelValueItf>();
const alarmRank = reactive<AlarmHandlType>({
  list: [],
});
const piniaStoreArea = storeArea();
let timeFrame = ref<ModelValueItf>();
const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();

const xData = ref(["7号", "8号", "9号", "10号", "11号", "12号", "13号"]);
const series = ref([
  {
    name: "输出电压",
    data: [324, 335, 318, 298, 392, 303, 317],
    linearGradientColor: ["rgba(160, 192, 255, 1)", "rgba(86, 142, 255, 1)"],
  },
  {
    name: "输入电压",
    data: [182, 262, 238, 244, 208, 243, 236],
    linearGradientColor: ["rgba(93, 219, 219, 1)", "rgba(120, 252, 252, 1)"],
  },
]);
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
// 报警处理排名
function changeHandleTime() {
  getAlarmHandlTop();
}
let alarmStatusData = ref([]);
let timer: any = reactive(null);
const column = ref([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelCode",
    slots: {
      customRender: "alarmLevelCode",
    },
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const data = ref([]);
const statusStyle = computed(() => (key: string) => {
  let option = alarmStatusOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});
const leaveStyle = computed(() => (key: string) => {
  let option = alarmLeaveOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});
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
async function getAlarmHandlTop() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  alarmRank.list = await statisticsDeviceTop(params);
}
// 动环报警
function changeTimeFrame() {
  getAlarmList();
}
// 报警状态数量和报警列表
async function getAlarmList() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  let res: any = await alarmStatisticsList(params);
  alarmStatusData.value = status.alarmStatusStatistics.map((item, index) => {
    item.color = colorList[index];
    return item;
  });
  alarmCon.value = {
    count: status.alarmNum,
    ratio: status.chainRatio,
  };
  data.value = res.records.map((item) => {
    item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
    return item;
  });
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
function init() {
  getAlarmList();
  getAlarmHandlTop();
}
onMounted(() => {
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
}

.body-bum {
  margin: 10px 0;

  &.alarm-num {
    color: #ffbaba;
  }
}

.roll-table {
  margin-top: 10px;
}
</style>
