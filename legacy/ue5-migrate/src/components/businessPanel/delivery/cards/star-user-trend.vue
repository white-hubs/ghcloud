<template>
  <SubPanelTemplate title="用户趋势统计">
    <div class="line-chart">
      <LineChart :x-data="xData" :series="yData" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";

import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const xData = ref([]);
const yData = ref([]);

const getUserStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getUserTrend?type=1", {
      headers: {
        Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
      },
    })
    .then((res) => {
      xData.value = res.data.data.map((item) => item.time);
      yData.value = [
        {
          name: "新增批发商",
          lineColor: "#58FAB6",
          linearGradientColor: ["#58FAB6"],
          data: res.data.data.map((item) => item.newWholesalerCount),
        },
        {
          name: "新增采购商",
          lineColor: "#2989FF",
          linearGradientColor: ["#2989FF"],
          data: res.data.data.map((item) => item.newBuyersCount),
        },
        {
          name: "新增企业用户",
          lineColor: "#FF6E23",
          linearGradientColor: ["#FF6E23"],
          data: res.data.data.map((item) => item.newEnterpriseCount),
        },
        {
          name: "新增个人用户",
          lineColor: "#FFC700",
          linearGradientColor: ["#FFC700"],
          data: res.data.data.map((item) => item.newPersonalCount),
        },
      ];
    });
};

onMounted(() => {
  getUserStatistic();
});
</script>

<style lang="less" scoped>
.line-chart {
  height: 230px;
}
</style>
