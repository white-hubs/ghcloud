<template>
  <SubPanelTemplate title="巡更点分布情况" class="alarm-event">
    <DeviceStatistics imgPath="business-icon/triage-queue/9.png" :statistic="deviceStatisticsData"></DeviceStatistics>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
          <div style="color: #fff; text-align: center; font-size: 0.072rem">{{ deviceStatisticsData.total }}</div>
          <div style="color: #fff; text-align: center; font-size: 0.072rem">总量</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import elevatorAnalysisPie from "../../public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import { electronArea } from "@/api/maintain";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";

const deviceStatisticsData = reactive({
  title: "巡更点总数",
  total: 0,
});
const detectionData = ref([]);

const changePatrol = async () => {
  const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
  const res = await electronArea({});
  deviceStatisticsData.total = res.total;
  res.locationAreaList.sort((a, b) => {
    return b.num - a.num;
  });
  let other = 0;
  res.locationAreaList.forEach((item, index) => {
    if (index <= 2) {
      detectionData.value.push({
        areaId: item.areaId,
        name: item.areaName,
        value: item.num,
        color: colors[index],
      });
    } else {
      other += item.num;
    }
  });
  if (res.locationAreaList.length > 3) {
    detectionData.value.push({
      name: "其他",
      value: other,
      color: "#19F8F7",
    });
  }
};

onMounted(() => {
  changePatrol();
});
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
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
