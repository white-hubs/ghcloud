<template>
  <SubPanelTemplate title="实时温度趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="RunTimeTime" @search="changeRunTimeTimeTime"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :titles="state.temperTrendData.title"
        :gridTop="'10'"
        :showLegend="true"
        :x-data="state.temperTrendData.xData"
        :series="state.temperTrendData.data"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { getTemperatureTrend } from "@/api/securitymanagement";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const RunTimeTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const state = reactive({
  temperTrendData: {
    xData: [] as any[],
    data: [] as any[],
    title: [] as any[],
  },
});

// 前端模拟数据
const demoData = {
  机组1: [
    { timeFlag: "08", deviceName: "机组1", dataValue: 2.3 },
    { timeFlag: "03", deviceName: "机组1", dataValue: 1.3 },
    { timeFlag: "02", deviceName: "机组1", dataValue: 3.3 },
    { timeFlag: "01", deviceName: "机组1", dataValue: 4.3 },
  ],
  机组2: [{ timeFlag: "02", deviceName: "机组1", dataValue: 2.3 }],
  机组3: [{ timeFlag: "04", deviceName: "机组1", dataValue: 2.3 }],
};

// 处理数据
const handleDataMap = (xData: string[], dataMap: any) => {
  return Object.keys(dataMap).map((item) => {
    return {
      name: item,
      data: xData.map((xItem) => {
        return dataMap[item].find((item: any) => item.timeFlag === xItem)
          ? dataMap[item].find((item: any) => item.timeFlag === xItem).dataValue
          : 0;
      }),
    };
  });
};

const changeRunTimeTimeTime = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: RunTimeTime.value.dateRange.join(","),
    type: RunTimeTime.value.timeType,
  };
  const result = await getTemperatureTrend(param);
  const dataMap = Object.keys(result.dataMap).length ? result.dataMap : demoData;
  const dataValue = handleDataMap(result.xtitle, result.dataMap);
  state.temperTrendData.xData = result.xtitle.map((item: string) => {
    if (RunTimeTime.value.timeType === "TODAY") {
      return item + "时";
    } else if (RunTimeTime.value.timeType === "THIS_YEAR") {
      return item + "月";
    } else {
      return item;
    }
  });
  state.temperTrendData.data = dataValue;
  state.temperTrendData.title = Object.keys(result.dataMap);
};
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
  width: 100%;
}
</style>
