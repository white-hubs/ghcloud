<template>
  <SubPanelTemplate title="设备在线情况">
    <div class="charts">
      <stackedBarChart :x-data="barXData" :y-data="barYData"></stackedBarChart>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { statusNum } from "@/api/securitymanagement";
import stackedBarChart from "@/components/businessPanel/Information-release/stacked-bar-chart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const barXData = ref<string[]>(["1号楼", "2号楼", "3号楼"]);
const barYData = ref<{ name: string; data: number[]; color: string }[]>([
  {
    name: "正常",
    data: [],
    color: "#2AE8BD",
  },
  {
    name: "离线",
    data: [],
    color: "#2989FF",
  },
]);

const getStatusNum = async () => {
  const res = await statusNum({ applicationCode: "TRAFFIC_LIGHT_SYS" });
  barXData.value = res.areaStatusNum.map((item) => {
    return item.areaName;
  });
  barYData.value[0].data = res.areaStatusNum.map((item) => {
    return item.onNum;
  });
  barYData.value[1].data = res.areaStatusNum.map((item) => {
    return item.offlineNum;
  });
};

onMounted(() => {
  getStatusNum();
});
</script>

<style lang="less" scoped>
.charts {
  height: 230px;
}
</style>
