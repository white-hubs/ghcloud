<template>
  <SubPanelTemplate title="园区租赁趋势">
    <div class="charts">
      <LineChart
        :x-data="xData"
        :series="yData"
        :showLegend="true"
        :showBackground="true"
        :titles="['']"
        gridTop="5"
        :unit="{ x: '', y: '' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { rentalTrends } from "@/api/park";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const xData = ref<string[]>(["1", "2", "3", "4", "5", "6", "7"]);
const yData = ref<{ name: string; data: number[] }[]>([
  {
    name: "",
    data: [],
  },
]);

const getRentalTrends = async () => {
  const res = await rentalTrends();
  xData.value = res.xtitle.map((item) => {
    return (item += "月");
  });
  yData.value[0].data = res.xtitle.map((xItem) => {
    return res.rentalTrends.find((item) => item.timeFlag === xItem) ? res.rentalTrends.find((item) => item.timeFlag === xItem).num : 0;
  });
};

onMounted(() => {
  getRentalTrends();
});
</script>

<style lang="less" scoped>
.charts {
  height: 240px;
}
</style>
