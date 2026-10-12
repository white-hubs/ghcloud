<template>
  <SubPanelTemplate title="账户消费Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
    </template>
    <div class="chart" v-if="alarmType.xData.length > 0">
      <barChart :x-data="alarmType.xData"
        :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
    </div>
    <div class="chart" v-else style="min-height: 150px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import { canteenConsumptionAccountStat } from "@/api/onecard";
import DateInlineForm, { ModelValueItf } from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";

const workOrderTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: []
});
const alarmType = reactive({
  xData: [] as string[],
  yData: [] as number[]
})
const changeHandleworkOrderTime = async ()=>{
  try {
    const res = await canteenConsumptionAccountStat({ 
      period: workOrderTime.value.dateRange.join(","),
      type: workOrderTime.value.timeType
    });
    if (Array.isArray(res)) {
      const result = res.sort((a: any, b: any) => b.amount - a.amount).slice(0, 10);
      alarmType.xData = result.map((item: any) => item.userName || item.name || '');
      alarmType.yData = result.map((item: any) => Number(item.amount || item.value || item.total || 0));
    }
  } catch (error) {
  }
}
</script>
<style lang="less" scoped>
.chart {
    height: 220px;
}
</style>