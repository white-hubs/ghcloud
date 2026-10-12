<template>
  <SubPanelTemplate title="营收趋势统计">
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

const getRevenueStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getRevenueTrend?type=1", {
      headers: {
        Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
      },
    })
    .then((res) => {
      xData.value = res.data.data.map((item) => item.time);
      yData.value = [
        {
          name: "累计运费",
          lineColor: "#4D9DFF",
          linearGradientColor: ["#4D9DFF"],
          data: res.data.data.map((item) => item.paymentTotal),
        },
        {
          name: "实收运费",
          lineColor: "#2989FF",
          linearGradientColor: ["#2989FF"],
          data: res.data.data.map((item) => item.actualPaymentTotal),
        },
        {
          name: "待月结算",
          lineColor: "#FFC700",
          linearGradientColor: ["#FFC700"],
          data: res.data.data.map((item) => item.monthPaymentTotal),
        },
        {
          name: "已退款运费",
          lineColor: "#FF6E23",
          linearGradientColor: ["#FF6E23"],
          data: res.data.data.map((item) => item.refundTotal),
        },
      ];
    });
};

onMounted(() => {
  getRevenueStatistic();
});
</script>

<style lang="less" scoped>
.line-chart {
  height: 220px;
}
</style>
