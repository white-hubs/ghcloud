<template>
  <SubPanelTemplate title="场所消费金额占比">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="fetchData"></DateInlineForm>
    </template>
    <div class="elevator-analysis" v-if="pieData.length > 0">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData">
          <div style="color: #fff;text-align: center;font-size: 14px;">{{ getDataTotal() }}</div>
          <div style="color: #fff;text-align: center;font-size: 14px;">消费金额(元)</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
    <div class="elevator-analysis" v-else style="min-height: 150px">
      <noData />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import noData from "@/components/businessPanel/public/noData.vue";
import { canteenConsumptionWindowStat } from "@/api/onecard";
import moment from "moment";
import DateInlineForm, { ModelValueItf } from "@/components/businessPanel/public/dateInlineForm.vue";


const pieData = ref<any[]>([])
const getDataTotal = ()=>{
  return pieData.value.reduce((sum, item) => sum + item.value, 0)
}

const workOrderTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: []
});

const fetchData = async () => {
  try {
    const res = await canteenConsumptionWindowStat({
      period: workOrderTime.value.dateRange.join(","),
      type: workOrderTime.value.timeType
    });
    if (Array.isArray(res)) {
      const total = res.reduce((sum: number, item: any) => sum + (Number(item.amount || item.value || 0)), 0);
      const colors = ['#306CCA', '#19F8F7', '#7885A0', '#F0C857', '#DE846C', '#FF6B6B', '#4ECDC4'];
      
      pieData.value = res.map((item: any, index: number) => {
        const value = Number(item.amount || item.value || 0);
        return {
          name: item.windowName || item.name || '',
          value: value,
          color: colors[index % colors.length],
          ratio: total ? ((value / total) * 100).toFixed(1) + '%' : '0%'
        };
      });
    }
  } catch (error) {
  }
}

</script>
<style lang="less" scoped>
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    width: 340px;
    height: 220px;
}
.alarm-analysis{
  height: auto;
}
</style>