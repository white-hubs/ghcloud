<template>
  <SubPanelTemplate title="隐患统计" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
    </template>
    <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="overView90.png" :statistic="equipmentStatisticsData">
    </DeviceStatistics>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
          <div style="color: #fff; text-align: center; font-size: 14px">{{ equipmentStatisticsData.total }}</div>
          <div style="color: #fff; text-align: center; font-size: 14px">隐患总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <hidden-danger-table :showModal="showModal" @close="showModal = false" :parameter="parameter"></hidden-danger-table>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import elevatorAnalysisPie from "../../public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DeviceStatistics from "../../security-monitoring-safty/device-statistics.vue";
import hiddenDangerTable from "../components/hidden-danger-table.vue";
import { hiddenNumStatistics, hiddenTypeStatistics } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

const showModal = ref(false);
const parameter = reactive({
  type: "",
  status: "",
  submitTime: "",
});

//隐患统计==================================================================================================
const eventTime = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const equipmentStatisticsData = reactive({
  title: "隐患总数",
  total: 48,
  itemize: [
    {
      name: "已完成隐患数",
      label: "处理中隐患数",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    },
  ],
});
const detectionData = ref([]);

const alarmEventTop = async () => {
  const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
  const res = await hiddenNumStatistics({ period: eventTime.value.dateRange.join(",") });
  const data = await hiddenTypeStatistics({ period: eventTime.value.dateRange.join(",") });
  equipmentStatisticsData.total = res.total;
  equipmentStatisticsData.itemize[0].offline = res.finished;
  equipmentStatisticsData.itemize[0].value = res.inHand;
  detectionData.value = data.typeStatisticsList.map((item, index) => {
    return {
      name: item.name,
      value: item.num,
      color: colors[index],
    };
  });
};

const handelClickItemize = (value) => {
  parameter.type = "ALL";
  if (value === "已完成隐患数") {
    parameter.status = "FINISHED";
  } else if (value === "处理中隐患数") {
    parameter.status = "ACTIVE";
  } else {
    parameter.status = "";
  }
  parameter.submitTime = eventTime.value.dateRange.join(",");
  showModal.value = true;
};
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}
</style>
