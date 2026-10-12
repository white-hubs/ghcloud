<template>
  <SubPanelTemplate title="人流通行趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
    </template>
    <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
    <div class="chart">
      <LineChart
        :x-data="ecahrtsData.xData"
        :series="[
          {
            data: ecahrtsData.yData,
            linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
          },
        ]"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import LineChart from "../../public/lineChart.vue";
import OperateDays from "../../public/operateDays.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { abnormalPassage } from "@/utils/requestData/accessControl";

const { globalState } = useStateStore();
let through = ref();
let numberPasses = ref(0);
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
let timer = ref<any>(null);

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

// 人流通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_PASS");
  ecahrtsData.xData = res.xdata;
  ecahrtsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};

const init = () => {
  abnormalPassageInfo();
};

onMounted(() => {
  init();
  timer.value = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped>
.chart {
  height: 180px;
  display: flex;
}
</style>
