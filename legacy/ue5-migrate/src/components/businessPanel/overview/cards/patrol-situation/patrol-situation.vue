<template>
  <SubPanelTemplate title="巡查态势">
    <PatrolSituation :statistic="inspectionSituationAnalysis"></PatrolSituation>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import PatrolSituation from "../../patrol-situation.vue";
import { depTaskExecutionAnalysis } from '@/api/maintain';
import moment from 'moment';

const inspectionSituationAnalysis = reactive({
  title: "巡检总数",
  total: 0,
  itemize: [
    {
      label: "任务总数",
      value: 0,
      color: "#7268FA",
    },
    {
      label: "超时任务数",
      value: 0,
      color: "#20E8E7",
    },
    {
      label: "过期任务数",
      value: 0,
      color: "#2F8DFF",
    },
    {
      label: "异常任务数",
      value: 0,
      color: "#35D93D",
    },
  ],
});

const getDepTaskExecutionAnalysis = async () => {
  const res = await depTaskExecutionAnalysis({ period: [moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(",") });
  inspectionSituationAnalysis.itemize[0].value = res.totalTaskNum;
  inspectionSituationAnalysis.itemize[1].value = res.overTimeTaskNum;
  inspectionSituationAnalysis.itemize[2].value = res.expiredTaskNum;
  inspectionSituationAnalysis.itemize[3].value = res.abnormalTaskNum;
  inspectionSituationAnalysis.total = res.totalTaskNum;
};

onMounted(() => {
  getDepTaskExecutionAnalysis();
});
</script>

<style lang="less" scoped>
</style>
