<template>
  <SubPanelTemplate title="报警趋势分析" image="icon-03.png" style="width: 100%;">
    <template #extra>
      <DateInlineForm
        v-model:modelValue="analysisTime"
        @search="changeReceptionAnalysisTime"
      ></DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart
        :x-data="gasChartData.xData"
        :series="gasChartData.yData"
        :showLegend="true"
        gridTop="15"
        :showBackground="true"
        :axisPointer="true"
        :titles="['报警总数', '已处理报警数']"
        :unit="{ x: '', y: '' }"
      />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getXaxleData, px2rem, autoPage, getXDataByType } from "@/utils/common";
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmTrendAnalysis } from "@/api/shennong/alarm";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const analysisTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警总数",
      data: [],
      linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
      lineColor: "#6194F7",
    },
    {
      name: "已处理报警数",
      data: [],
      linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
      lineColor: "rgba(149, 188, 249, 1)",
    },
  ],
});
const changeReceptionAnalysisTime = async () => {
  let param = {
    period: analysisTime.value.dateRange.join(","),
    type: analysisTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
  };
  let { alarmHandlerTrends, alarmTrends } = await alarmTrendAnalysis(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });
  gasChartData.xData = getXDataByType(analysisTime.value.timeType, xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
  gasChartData.yData[1].data = alarmHandlerTrends.map((item) => {
    return item.totalNum;
  });
};
watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeReceptionAnalysisTime();
  }
);
</script>
<style scoped lang="less">
:deep(.ant-statistic) {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
:deep(.ant-statistic-title) {
  white-space: nowrap;
  margin-bottom: 0;
}
:deep(.ant-statistic-content) {
  font-size: 14px !important;
  padding-left: 0 !important;
}
:deep(.grid-container) {
  display: flex;
  width: 100%;
}
:deep(.grid-item) {
  flex: 1;
}

.appointment-data {
  display: flex;
  align-items: center;
  height: 100%;

  img {
    width: 20px;
    height: 20px;
  }

  :deep(.policeList) {
    display: flex;
    flex-flow: column;
    justify-content: center;

    .thePolice {
      margin-bottom: 6px;
      background: rgba(171, 177, 189, 0.12);

      .thePoliceLeft {
        overflow: visible;
      }
    }
  }
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 220px;
}
</style>
