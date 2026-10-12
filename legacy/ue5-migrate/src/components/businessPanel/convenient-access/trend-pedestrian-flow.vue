<template>
  <SubPanelTemplate title="人流通行趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
    </template>
    <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
    <div class="chart">
      <LineChart :x-data="echartsData.xData" :series="[
            {
              data: echartsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { abnormalPassage } from '@/utils/requestData/accessControl'

let through = ref();
let numberPasses = ref(0);
const echartsData = reactive({
  xData: [],
  yData: [],
});
// 人流通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_PASS");
  echartsData.xData = res.xdata;
  echartsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};
</script>
<style lang="less" scoped>
.chart {
    height: 220px;
  }
</style>