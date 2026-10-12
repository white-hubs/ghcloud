<template>
  <SubPanelTemplate title="消费金额趋势图">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmAnalysisTime" @search="changeHandleAlarmAnalysisTime">
      </DateInlineForm>
    </template>
    <div class="chart" v-if="receptionTrendsChartData.xData.length > 0" >
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '元' }" />
    </div>
    <div class="chart" v-else style="min-height: 150px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import DateInlineForm, { ModelValueItf } from "@/components/businessPanel/public/dateInlineForm.vue";
import { canteenConsumptionAmountTrend } from "@/api/onecard";
import noData from "@/components/businessPanel/public/noData.vue";

const alarmAnalysisTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: []
});
const receptionTrendsChartData = reactive({
    xData: [] as string[],
    yData: [
        { data: [] as number[]},
    ]
})
const changeHandleAlarmAnalysisTime = async ()=>{
  try {
    const res = await canteenConsumptionAmountTrend({
      period: alarmAnalysisTime.value.dateRange.join(","),
      type: alarmAnalysisTime.value.timeType
    });
    if (res || Array.isArray(res)) {
      receptionTrendsChartData.xData = res.map((item: any) => item.period);
      receptionTrendsChartData.yData[0].data = res.map((item: any) => Number(item.amount || item.value || item.count || 0));
    }
  } catch (error) {
  }
}
</script>
<style lang="less" scoped></style>