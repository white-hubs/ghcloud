<template>
  <SubPanelTemplate title="报警事件占比" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
    </template>
    <DeviceStatistics
      @handelClickItemize="handelClickItemize"
      imgPath="business-icon/triage-queue/10.png"
      :statistic="deviceStatisticsData"
    ></DeviceStatistics>
    <div class="elevator-analysis">
      <elevator-analysis-pie @clickbar="alarmClickBar" :pieData="detectionData" style="width: 50%; height: 1rem">
        <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.082rem)">
          {{ deviceStatisticsData.total }}
        </div>
        <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">报警总数（个）</div>
      </elevator-analysis-pie>
      <elevatorAnalysisList
        @handlecurrent="alarmClickBar"
        :showRatio="true"
        :contentList="detectionData"
        class="pie_list"
      ></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :alarmLevelCode="alarmLevelCode"
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="parameter"
  ></modal-alarm-table>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import elevatorAnalysisPie from "../../public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DeviceStatistics from "../device-statistics.vue";
import { getstatus, groupTotalSearch } from "@/api/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const eventTime = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const alarmLevelCode = ref("");
const alarmModalShow = ref<boolean>(false);
const detectionData = ref([
  {
    name: "正常",
    color: "#2AE8BD",
    value: 317,
  },
  {
    name: "故障",
    color: "#FFC700",
    value: 23,
  },
  {
    name: "关闭",
    color: "#3590FF",
    value: 30,
  },
]);
const deviceStatisticsData = reactive({
  title: "报警总数",
  total: 48,
  itemize: [
    {
      name: "处理中",
      label: "挂起",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    },
    {
      name: "已处理",
      label: "待确认",
      value: 23,
      offline: 15,
      key: "OFFLINE2",
    },
  ],
});
const parameter = reactive({
  alarmEventTypeId: "",
  dateRange: [],
  alarmStatus: "",
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const alarmEventTop = async () => {
  const res = await getstatus({
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    type: eventTime.value.timeType,
  });
  deviceStatisticsData.total = res.alarmNum;
  deviceStatisticsData.itemize[0].value = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_SUSPEND").alarmNum;
  deviceStatisticsData.itemize[0].offline = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_PROGRESS_CONFIRMED").alarmNum;
  deviceStatisticsData.itemize[1].value = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_UN_CONFIRMED").alarmNum;
  deviceStatisticsData.itemize[1].offline = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_HANDLER").alarmNum;
  const data = await groupTotalSearch({
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
  });
  const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];
  detectionData.value = data.map((item, index) => {
    return {
      id: item.id,
      name: item.name,
      value: item.totalNum,
      color: colors[index],
    };
  });
};
const handelClickItemize = (value) => {
  const obj = {
    挂起: "ALARM_SUSPEND",
    处理中: "ALARM_PROGRESS_CONFIRMED",
    待确认: "ALARM_UN_CONFIRMED",
    已处理: "ALARM_HANDLER",
  };
  parameter.alarmStatus = obj[value];
  parameter.alarmEventTypeId = undefined;
  parameter.dateRange = eventTime.value.dateRange;
  alarmModalShow.value = true;
};
const alarmClickBar = (value) => {
  parameter.alarmStatus = undefined;
  parameter.alarmEventTypeId = value.id;
  parameter.dateRange = eventTime.value.dateRange;
  alarmModalShow.value = true;
};

// Auto-refresh logic
let timer: any = null;
function init() {
  alarmEventTop();
}
onMounted(() => {
  init();
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  padding-top: 0;
  align-items: center;
  height: 220px;
  .pie_list {
    width: 50%;
  }
}
</style>
