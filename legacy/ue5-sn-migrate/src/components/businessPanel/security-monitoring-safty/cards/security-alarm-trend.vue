<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title">
      <template #extra>
      <DateInlineForm
        v-model:modelValue="timeTypeqs"
        @search="timeDateqs"
      ></DateInlineForm>
    </template>
      <div class="chart">
        <LineChart
          :x-data="gasChartData.xData"
          :series="gasChartData.yData"
          :showLegend="true"
          gridTop="15"
          :showBackground="true"
          :axisPointer="true"
          :unit="{ x: '', y: '' }"
        />
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { statisticstrend } from "@/api/saftsecurity/index";
import { reactive, ref } from "vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '报警趋势'
})
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
let timeTypeqs = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const timeDateqs = async () => {
  const data = await statisticstrend({
    areaId: piniaStoreArea.currentAreaId,
    period: timeTypeqs.value.dateRange.join(","),
    sceneType: piniaStoreMenu.currentMenu,
    type: timeTypeqs.value.timeType,
  });
  gasChartData.xData = data.map((res) => {
    return res.period;
  });
  gasChartData.yData[0].data = data.map((res) => {
    return res.alarmNum;
  });
};
const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警数",
      data: [],
      linearGradientColor: ["#6194F7", "#6194F7"],
      lineColor: "#6194F7",
    },
  ],
});
</script>
<style lang="less" scoped>
.panel {
  .chart {
    height: 220px;
  }
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
.barChart {
  height: 200px;
}
</style>
