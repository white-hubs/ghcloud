<template>
  <SubPanelTemplate title="设备报警趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
    </template>
    <OperateDays :value="alarmNum" title="报警总数">
      <div class="ringRatio">
        <span>环比</span>
        <!-- uptriangle 向上三角根据Prop改变 -->
        <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
        <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
      </div>
    </OperateDays>
    <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
    <div class="charts">
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmTrend, equipmentNumber } from "@/utils/requestData/alarm";

const { globalState } = useStateStore();
const trend = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
let alarmStatusData = reactive([]);
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData = data.alarmStatusStatistics;
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
</script>

<style lang="less" scoped>
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.charts {
  height: 230px;
}
</style>
