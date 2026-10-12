<template>
  <SubPanelTemplate title="任务异常记录">
    <template #extra>
      <DateInlineForm v-model:modelValue="taskExceptionTime" @search="changeTaskException"></DateInlineForm>
    </template>
    <DeviceStatistics imgPath="business-icon/triage-queue/9.png" :statistic="taskStatisticsData"></DeviceStatistics>
    <div class="roll-table">
      <RollTable @clickRow="clickRow" :column="column" :data="patrolData"> </RollTable>
    </div>
  </SubPanelTemplate>
  <modal-command-dispatch
    :show-modal="commandModalShow"
    @close="commandModalShow = false"
    :parameter="commandParameter"
  ></modal-command-dispatch>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import RollTable from "../../public/rollTable/index.vue";
import modalCommandDispatch from "../components/modal-command-dispatch.vue";
import { taskAbnormalList, taskAbnormalNum } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";

const taskStatisticsData = reactive({
  title: "异常任务数",
  total: 0,
  itemize: [
    {
      label: "未处理数",
      name: "已处理数",
      value: 0,
      offline: 0,
    },
  ],
});

const commandParameter = ref<Record<string, any>>({
  id: "",
});
const commandModalShow = ref<boolean>(false);
const taskExceptionTime = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const patrolData = ref([]);
const column = [
  {
    title: "任务名称",
    dataIndex: "taskName",
  },
  {
    title: "时间段",
    dataIndex: "timePeriod",
  },
  {
    title: "状态",
    dataIndex: "state",
  },
  {
    title: "执行人",
    dataIndex: "username",
  },
];

const changeTaskException = async () => {
  const res = await taskAbnormalNum({ type: taskExceptionTime.value.timeType, period: taskExceptionTime.value.dateRange.join(",") });
  const data = await taskAbnormalList({
    type: taskExceptionTime.value.timeType,
    period: taskExceptionTime.value.dateRange.join(","),
    pageNumber: 1,
    pageSize: 50,
  });
  taskStatisticsData.total = res.abnormalNum;
  taskStatisticsData.itemize[0].value = res.undoNum;
  taskStatisticsData.itemize[0].offline = res.finishedNum;
  patrolData.value = data.records;
};

const clickRow = async (params) => {
  commandParameter.value.id = params.taskId;
  commandModalShow.value = true;
};

onMounted(() => {
  changeTaskException();
});
</script>

<style lang="less" scoped></style>
