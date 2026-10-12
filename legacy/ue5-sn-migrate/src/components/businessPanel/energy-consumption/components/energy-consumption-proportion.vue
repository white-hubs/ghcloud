<template>
  <SubPanelTemplate :title="title">
   <template #extra>
     <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
    </template>
    <div class="chart">
      <pieGuidance :y-data="yData" ></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import { ModelValueItf } from '../../public/types'
import pieGuidance from "../../public/charts/pie/pie-guidance.vue"
import { usageStatTypeList } from '@/api/energy'
interface Props {
title: string; 
}
const colorList=['#2AE8BD',"#FFC700", "#3590FF", "#19F8F7", "#EF424A",'#c4ceda','#8c8f96'];
const props = withDefaults(defineProps<Props>(), {
title: '综合能耗分类占比',
});
const yData = ref([
    { name: '在线', value: 5.6, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 1, itemStyle: { color: "#2AE8BD" } },
    { name: '关屏', value: 1, itemStyle: { color: "#ccc" } },
])
let timeFrame = ref<ModelValueItf>();
const getAlarmLevel = async()=> {
 const res = await usageStatTypeList({period:timeFrame.value.dateRange.join(",")})
 yData.value = res.map((e,i)=>{
  return {
    name:e.instrumentTypeName,
    value:e.zhValue,
    itemStyle:{
      color:colorList[i]
    }
  }
 })
}
</script>
<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>