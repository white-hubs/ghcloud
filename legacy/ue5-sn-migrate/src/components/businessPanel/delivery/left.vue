<template>
  <div class="panel">
    <SubPanelTemplate title="订单分布统计">
      <div class="statistic-container">
        <a-statistic
          v-for="item in order.statistic"
          :title="item.title"
          :value="item.value"
          :valueStyle="{ color: item.color, fontWeight: 'robotoMedium' }"
        ></a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="订单趋势统计">
      <div class="line-chart">
        <LineChart :x-data="order.xData" :series="order.yData" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="用户分布统计">
      <div class="statistic-container">
        <a-statistic
          v-for="item in user.statistic"
          :title="item.title"
          :value="item.value"
          :valueStyle="{ color: item.color, fontWeight: 'robotoMedium' }"
        ></a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="用户趋势统计">
      <div class="line-chart">
        <LineChart :x-data="user.xData" :series="user.yData" />
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "../public/lineChart.vue";
import axios from "axios";
interface SeriesItf {
  name?: string;
  data?: number[];
  linearGradientColor?: string[];
  showSymbol?: boolean;
  lineColor?: string;
}
interface StatisticType {
  statistic: { title: string; value: number; color: string }[];
  xData: string[];
  yData: SeriesItf[];
}

const order: StatisticType = reactive({
  statistic: [
    {
      title: "累计订单",
      value: 1164407,
      color: "#4D9DFF",
    },
    {
      title: "非月结正常订单",
      value: 1163863,
      color: "#2989FF",
    },
    {
      title: "月结正常订单",
      value: 544,
      color: "#58FAB6",
    },
    {
      title: "退款订单",
      value: 23643,
      color: "#FF6E23",
    },
  ],
  xData: [],
  yData: [],
});
const user: StatisticType = reactive({
  statistic: [
    {
      title: "累计用户",
      value: 5966,
      color: "#4D9DFF",
    },
    {
      title: "企业用户",
      value: 5,
      color: "#19F8F7",
    },
    {
      title: "批发商",
      value: 4424,
      color: "#FFC700",
    },
    {
      title: "采购商",
      value: 1542,
      color: "#58FAB6",
    },
  ],
  xData: [],
  yData: [],
});
onMounted(() => {
  getOrderStatistic();
  getUserStatistic();
  //   let day = moment().format("DD");
  //   for (let i = 0; i < Number(day); i++) {
  //     order.xData.unshift(moment().subtract(i, "days").format("YYYY-MM-DD"));
  //   }
});
/**
 * 2023-04-26临时添加为演示可以看到数据
 */
const getOrderStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getOrderTrend?type=1", {
      headers: {
        Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nJ3M+aYrXToAzc6n5M0sGoa5T0VFS66VCERy9GH65y7CoeVB4isYBT5Dg+WOhe5KDHp6pM/hi1z4WX/xITNOjqZG/RZDU83cHvZEobAOv1bxMaL4W4+TMovGOUBKLuSySTZsIOua88YiMw6lQuPxYq5DRy1GBYcdFQU8gl4ZckI6",
      },
    })
    .then((res) => {
      order.xData = res.data.data.map((item) => item.time);
      order.yData = [
        {
          name: "月结正常订单",
          lineColor: "#19F8F7",
          data: res.data.data.map((item) => item.monthPayCount),
        },
        {
          name: "非月结正常订单",
          lineColor: "#2989FF",
          data: res.data.data.map((item) => item.unMonthPayCount),
        },
        {
          name: "退款订单",
          lineColor: "#FF6E23",
          data: res.data.data.map((item) => item.refundCount),
        },
      ];
    });
};
const getUserStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getUserTrend?type=1", {
      headers: {
        Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nJ3M+aYrXToAzc6n5M0sGoa5T0VFS66VCERy9GH65y7CoeVB4isYBT5Dg+WOhe5KDHp6pM/hi1z4WX/xITNOjqZG/RZDU83cHvZEobAOv1bxMaL4W4+TMovGOUBKLuSySTZsIOua88YiMw6lQuPxYq5DRy1GBYcdFQU8gl4ZckI6",
      },
    })
    .then((res) => {
      user.xData = res.data.data.map((item) => item.time);
      user.yData = [
        {
          name: "新增批发商",
          lineColor: "#58FAB6",
          data: res.data.data.map((item) => item.newWholesalerCount),
        },
        {
          name: "新增采购商",
          lineColor: "#2989FF",
          data: res.data.data.map((item) => item.newBuyersCount),
        },
        {
          name: "新增企业用户",
          lineColor: "#FF6E23",
          data: res.data.data.map((item) => item.newEnterpriseCount),
        },
        {
          name: "新增个人用户",
          lineColor: "#FFC700",
          data: res.data.data.map((item) => item.newPersonalCount),
        },
      ];
    });
};
</script>
<style lang="less" scoped>
.panel {
  height: 100%;
  overflow: hidden;
}
.statistic-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  :deep(.ant-statistic) {
    &-title {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
.line-chart {
  height: 230px;
}
</style>
