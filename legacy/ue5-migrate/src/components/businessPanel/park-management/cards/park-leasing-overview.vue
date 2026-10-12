<template>
  <SubPanelTemplate title="园区租赁总情况">
    <div class="flex-between mg-10">
      <PlanPie :pieData="levelPieData"> </PlanPie>
      <PieList :roundPieData="levelPieData"></PieList>
    </div>
    <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { parkLeasing } from "@/api/park";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const levelPieData = ref([
  {
    name: "已租赁",
    color: "#29C2FF",
    value: 0,
  },
  {
    name: "未租赁",
    color: "#74AEE7",
    value: 0,
  },
]);
const columns = ref([
  {
    title: "租赁情况",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "面积",
    dataIndex: "useArea",
  },
  {
    title: "占比",
    dataIndex: "useAreaRate",
  },
]);
const industryStatistics = ref([]);

const getParkLeasing = async () => {
  const res = await parkLeasing();
  const color = ["#29C2FF", "#74AEE7"];
  levelPieData.value = res.leased.map((item, index) => {
    return {
      name: item.name,
      color: color[index],
      value: item.useArea,
    };
  });
  industryStatistics.value = res.leased.map((item) => {
    return {
      name: item.name,
      useArea: item.useArea + "㎡",
      useAreaRate: item.useAreaRate + "%",
    };
  });
};

onMounted(() => {
  getParkLeasing();
});
</script>

<style lang="less" scoped>
.mg-10 {
  :deep(.policeList) {
    height: auto;
  }
}
</style>
