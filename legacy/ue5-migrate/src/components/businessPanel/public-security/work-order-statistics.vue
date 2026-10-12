<template>
    <SubPanelTemplate title="报修工单统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="workOrderTime"
          @search="changeHandleworkOrderTime"
        ></DateInlineForm>
      </template>
      <div class="charts">
        <barChart :title="''" :x-data="xData"
            :data="[{ color: '#1890FF', name: '', data: yData }]" class="columnBox" />
    </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import { ModelValueItf } from '../public/types'
import {getFaultyEquipmentTop, getHazardStatistics} from "@/api/merchant"

const workOrderTime = ref<ModelValueItf>();
const xData = ref<string[]>([])
const yData = ref<number[]>([])
const changeHandleworkOrderTime = async() => { 
 const res = await getFaultyEquipmentTop({period:workOrderTime.value.dateRange.join(',')})
    xData.value.length = 0
    yData.value.length = 0
    res.forEach(item=>{
      xData.value.push(item.name)
      yData.value.push(item.value)
    })
};
</script>
<style lang="less" scoped>
.charts{
  height: 220px;
}
</style>