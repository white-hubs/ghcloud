<template>
    <SubPanelTemplate title="异常通行趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
      <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
      <div class="chart">
        <LineChart :x-data="ecahrtsData.xData" :series="[
            {
              data: ecahrtsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { abnormalPassage } from '@/utils/requestData/accessControl'
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";

let through = ref();
let numberPasses = ref(0);
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
// 异常通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
  ecahrtsData.xData = res.xdata;
  ecahrtsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};
</script>
<style lang="less" scoped>
</style>