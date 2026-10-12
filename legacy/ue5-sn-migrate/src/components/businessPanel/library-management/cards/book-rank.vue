<template>
  <SubPanelTemplate>
    <template #extra>
      <DateInlineForm v-model:modelValue="hiddenDangerTime" @search="changeHandleHiddenDangerTime"></DateInlineForm>
    </template>
    <div class="lineChart">
      <barChart :title="''" :unit="''" :x-data="xData" :data="[{ color: '#1890FF', name: '', data: yData }]" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ref } from 'vue'
import { ModelValueItf } from '@/components/businessPanel/public/types'
import { borrowRecordHotTop } from '@/api/library-management'

const hiddenDangerTime = ref<ModelValueItf>()
const changeHandleHiddenDangerTime =async ()=>{
  const res = await borrowRecordHotTop({period:hiddenDangerTime.value.dateRange.join(","),hostType:'BOOK_NAME',topNumber:10})
  xData.value = res.map(e=>e.key)
  // xData.value = res.map((e)=>{
  //   return e.key.length<5?e.key:e.key.slice(0,5)+"..."
  // })
  yData.value = res.map(e=>e.value)
}
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
</script>
<style lang="less" scoped>
.lineChart{
   height: 220px;
  }
</style>