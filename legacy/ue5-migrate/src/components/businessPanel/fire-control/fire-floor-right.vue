<template>
  <div >
    <SubPanelTemplate title="报警设备top5">
      <div class="header">
        <DateInlineForm
          v-model:modelValue="handleTime"
          @search="changeHandleTime"
        ></DateInlineForm>
      </div>
      <div class="body" style="min-height: 250px" v-show="alarmRank.list.length > 0">
        <EventAlarmItem
          v-for="(item, index) in alarmRank.list"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" style="min-height: 150px" v-show="alarmRank.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="消防报警">
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
        <RollTable
          :column="column"
          :data="data"
          class="roll-table"
          @click-row="handelClickRow"
        >
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
import EventAlarmItem from "../public/eventAlarmItem.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import RollTable from "../public/rollTable/index.vue";
import moment from "moment";
import enumeratie from "@/utils/enumeratie";
import { ModelValueItf } from "../public/types";
import { alarmStatisticsList, statisticsStatus } from "@/api/alarm";
import { AlarmStatus, AlarmAreaTop } from "@/api/models/alarm";
import bus from "@/utils/bus";
import { mockStatisticsAreaTopFloor } from "@/mock/environmental-monitor"
import { useStateStore } from "@/pages/state/use-state-store";

let timer: any = reactive(null);
const { globalState } = useStateStore();
let timeFrame = ref<ModelValueItf>();
let handleTime = ref<ModelValueItf>();
interface AlarmHandlType {
  list: AlarmAreaTop[];
}
const alarmRank = reactive<AlarmHandlType>({
  list: [],
});
const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];

const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
const alarmCon = ref({
  count: 0,
  ratio: 10,
});

let alarmStatusData = ref<AlarmStatus[]>([]);

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
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 报警处理排名
const changeHandleTime = () => {
  getAlarmHandlTop();
};
const getAlarmHandlTop = async () => {
  alarmRank.list =  mockStatisticsAreaTopFloor({'timeType': handleTime.value.timeType as TimeType});
};

// 消防报警
function changeTimeFrame() {
  getAlarmList();
}
// 报警状态数量和报警列表
async function getAlarmList() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  let res = await alarmStatisticsList(params);
  // let status = mockStatisticsStatusFloor({'timeType': timeFrame.value.timeType as TimeType});
  // let res = mockAlarmStatisticsList({'timeType': timeFrame.value.timeType as TimeType});
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
.body-num {
  margin: 10px 0;
}

.roll-table {
  margin-top: 10px;
}
</style>
