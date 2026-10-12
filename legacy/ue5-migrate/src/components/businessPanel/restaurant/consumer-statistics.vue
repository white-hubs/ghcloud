<template>
  <SubPanelTemplate title="消费人数统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
    </template>
    <div class="stacked-bar-chart" v-if="barData.xData.length > 0">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
    <div class="stacked-bar-chart" v-else style="min-height: 150px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import DateInlineForm, { ModelValueItf } from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { canteenConsumptionUserNumberTrend } from "@/api/onecard";

const workOrderTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: []
});

const barData = reactive({
  xData: [] as string[],
  yData: [
    {
      data: [] as number[],
      name: '',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})

const changeHandleworkOrderTime = async () => {
  if(!workOrderTime.value?.dateRange?.length) return;
  try {
    const res = await canteenConsumptionUserNumberTrend({ period: workOrderTime.value.dateRange.join(","), type: workOrderTime.value.timeType });
    if (Array.isArray(res)) {
      barData.xData = res.map((item: any) => item.period || item.date || item.key);
      barData.yData[0].data = res.map((item: any) => Number(item.personCount || item.value || item.num || 0));
    }
  } catch (error) {
  }
}

</script>
<style lang="less" scoped>
.stacked-bar-chart{
  height: 240px;
}
</style>