<template>
  <div >
    <SubPanelTemplate title="营收分布统计">
      <div class="statistic-container">
        <a-statistic
          v-for="item in revenue.statistic"
          :title="item.title"
          :value="item.value"
          :valueStyle="{ color: item.color, fontWeight: 'robotoMedium' }"
        ></a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="营收趋势统计">
      <div class="line-chart">
        <LineChart :x-data="revenue.xData" :series="revenue.yData" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="实时评价">
      <RollTable :column="revenue.column" :data="revenue.tableData"></RollTable>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "../public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import { onMounted, reactive } from "vue";
import axios from "axios";
import moment from "moment";
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
  column: {
    title: string;
    dataIndex: string;
    slots?: { customRender: string };
    customRender?: Function;
  }[];
  tableData: {
    evaluationTime: string;
    mobile: string;
    evaluationType: string;
    evaluationAvg: string;
  }[];
}
const revenue: StatisticType = reactive({
  statistic: [
    {
      title: "累计运费",
      value: 27094779.87,
      color: "#4D9DFF",
    },
    {
      title: "实收运费",
      value: 23716692.33,
      color: "#2989FF",
    },
    {
      title: "待月结算",
      value: 9613,
      color: "#FFC700",
    },
    {
      title: "已退款运费",
      value: 433844.74,
      color: "#FF6E23",
    },
  ],
  xData: [],
  yData: [],
  column: [
    {
      title: "评价时间",
      dataIndex: "evaluationTime",
    },
    {
      title: "评价人",
      dataIndex: "mobile",
      slots: {
        customRender: "mobile",
      },
      customRender: (text) => {
        return text.substr(0, 3) + "****" + text.substr(7);
      },
    },
    {
      title: "类型",
      dataIndex: "evaluationType",
      slots: {
        customRender: "evaluationType",
      },
      customRender: (text) => {
        return text === "0" ? "收件人" : "寄件人";
      },
    },
    {
      title: "评价分数",
      dataIndex: "evaluationAvg",
    },
  ],
  tableData: [],
});
onMounted(() => {
  getRevenueStatistic();
  getScoreList();
});
const getRevenueStatistic = () => {
  axios
    .get("http://112.19.169.2:9090/statistics/getRevenueTrend?type=1", {
      headers: {
        Authorization:
        "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
      },
    })
    .then((res) => {
      revenue.xData = res.data.data.map((item) => item.time);
      revenue.yData = [
        {
          name: "累计运费",
          lineColor: "#4D9DFF",
          linearGradientColor:["#4D9DFF"],
          data: res.data.data.map((item) => item.paymentTotal),
        },
        {
          name: "实收运费",
          lineColor: "#2989FF",
          linearGradientColor:["#2989FF"],
          data: res.data.data.map((item) => item.actualPaymentTotal),
        },
        {
          name: "待月结算",
          lineColor: "#FFC700",
          linearGradientColor:["#FFC700"],
          data: res.data.data.map((item) => item.monthPaymentTotal),
        },
        {
          name: "已退款运费",
          lineColor: "#FF6E23",
          linearGradientColor:["#FF6E23"],
          data: res.data.data.map((item) => item.refundTotal),
        },
      ];
    });
};
const getScoreList = () => {
  axios
    .post(
      "http://112.19.169.2:9090/evaluation/order/page",
      { curPage: 1, pageSize: 20 },
      {
        headers: {
          Authorization:
          "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
        },
      }
    )
    .then((res) => {
      revenue.tableData = res.data.data.records;
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
  height: 220px;
}
</style>
