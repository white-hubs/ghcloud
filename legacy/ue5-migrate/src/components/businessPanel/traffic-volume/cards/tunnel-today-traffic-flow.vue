<template>
  <SubPanelTemplate title="隧道今日车流量分析">
    <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
    <div class="charts">
      <LineChart
        :x-data="xData"
        :series="yData"
        :showLegend="true"
        :showBackground="true"
        :titles="titles"
        gridTop="15"
        :unit="{ x: '', y: '人次' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import { trafficFlowTunnels } from "@/api/securitymanagement";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const alarmStatusData = ref([
  { alarmStatus: "0", alarmStatusName: "进入", alarmNum: 0, color: "rgb(255, 199, 0)" },
  { alarmStatus: "1", alarmStatusName: "离开", alarmNum: 0, color: "rgb(0, 242, 123)" },
]);
const xData = ref<string[]>([]);
const yData = ref<
  {
    name: string;
    data: number[];
    linearGradientColor?: string[];
    lineColor?: string;
    showSymbol?: boolean;
    smooth?: boolean;
    symbolSize?: number;
  }[]
>([
  {
    data: [0],
    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
    name: "进入",
  },
  {
    data: [0],
    linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
    lineColor: "rgba(120, 252, 252, 1)",
    name: "离开",
  },
]);
const titles = ref<string[]>([]);

const getTrafficFlowTunnels = async () => {
  const res = await trafficFlowTunnels({
    period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
  });
  alarmStatusData.value[0].alarmNum = res.directionTotalIn;
  alarmStatusData.value[1].alarmNum = res.directionTotalOut;
  xData.value = res.xtitle.map((item) => {
    return item + "时";
  });
  yData.value[0].data = res.xtitle.map((xItem) => {
    return res.directionInList.find((item) => item.timeFlag === xItem)
      ? res.directionInList.find((item) => item.timeFlag === xItem).num
      : 0;
  });
  yData.value[1].data = res.xtitle.map((xItem) => {
    return res.directionOutList.find((item) => item.timeFlag === xItem)
      ? res.directionOutList.find((item) => item.timeFlag === xItem).num
      : 0;
  });
};

onMounted(() => {
  getTrafficFlowTunnels();
});
</script>

<style lang="less" scoped>
.charts {
  height: 250px;
}
</style>
