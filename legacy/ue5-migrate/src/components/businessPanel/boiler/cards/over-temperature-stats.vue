<template>
  <SubPanelTemplate title="超温统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
    </template>
    <div class="flex-between">
      <PlanPie :pieData="overTemperData">
        <div class="content">
          <div class="total-num">{{ temperatureAlarmTotal }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="overTemperData"></PieList>
    </div>
    <div class="barChart">
      <overviewChartBar :bottom="'0%'" :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { getBoilerOverTemperStatistics } from "@/api/securitymanagement";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

const transactionTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];

const barData = reactive({
  xData: ["1", "2", "3"] as any[],
  yData: [
    {
      data: [] as any[],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});
const overTemperData = ref<any[]>([]);
const temperatureAlarmTotal = ref(0);

const changeTransactionTime = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    period: transactionTime.value.dateRange.join(","),
    type: transactionTime.value.timeType,
  };
  const result = await getBoilerOverTemperStatistics(param);
  barData.xData = result.xtitle;
  temperatureAlarmTotal.value = 0;
  barData.yData[0].data = result.xtitle.map((xItem: any) => {
    return result.timeGroupStatistics.find((item: any) => item.dateFlag === xItem)
      ? result.timeGroupStatistics.find((item: any) => item.dateFlag === xItem)?.alarmNum
      : 0;
  });
  overTemperData.value = result.deviceStatistics.map((item: any, index: number) => {
    temperatureAlarmTotal.value += item.alarmNum;
    return {
      label: item.deviceName,
      value: item.alarmNum,
      color: colorList[index],
    };
  });
};

onMounted(() => {
  changeTransactionTime();
});
</script>

<style lang="less" scoped>
.barChart {
  height: 200px;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

:deep(.policeList) {
  height: auto;
}
</style>
