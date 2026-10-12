<template>
  <SubPanelTemplate title="订单趋势统计">
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

const getOrderStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getOrderTrend?type=1", {
      headers: {
        Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
      },
    })
    .then((res) => {
      xData.value = res.data.data.map((item) => item.time);
      yData.value = [
        {
          name: "月结正常订单",
          lineColor: "#19F8F7",
          linearGradientColor: ["#19F8F7"],
          data: res.data.data.map((item) => item.monthPayCount),
        },
        {
          name: "非月结正常订单",
          lineColor: "#2989FF",
          linearGradientColor: ["#2989FF"],
          data: res.data.data.map((item) => item.unMonthPayCount),
        },
        {
          name: "退款订单",
          lineColor: "#FF6E23",
          linearGradientColor: ["#FF6E23"],
          data: res.data.data.map((item) => item.refundCount),
        },
      ];
    });
};

onMounted(() => {
  getOrderStatistic();
});
</script>

<style lang="less" scoped>
.line-chart {
  height: 230px;
}
</style>
