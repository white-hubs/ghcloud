<!-- 物业收入明细 -->
<template>
  <SubPanelTemplate>
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="stacked-bar-chart">
      <StackedBar :xData="alarmStatisticsData.chartData.xData" :yData="alarmStatisticsData.chartData.yData" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import StackedBar from '@/components/businessPanel/public/charts/stacked-bar/stacked-bar.vue';

const overviewTime = ref<ModelValueItf>()
const alarmStatisticsData = reactive({
  chartData: {
      xData: ['水费', '电费', '修缮费', '物管费'],
      yData: [
        { name: '支出', value: [10, 10, 8, 6], color: "#2989FF" },
        { name: '收入', value: [10, 10, 8, 6], color: "#2AE8BD" },
      ]
  }
})
const changeHandleOverviewTime = ()=>{

}
</script>
<style lang="less" scoped>
.stacked-bar-chart {
    width: 100%;
    height: 220px;
}
</style>