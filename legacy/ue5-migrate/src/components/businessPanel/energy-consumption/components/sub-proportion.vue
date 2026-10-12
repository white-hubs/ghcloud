<template>
  <SubPanelTemplate :title="title">
   <template #extra>
    <div style="display: flex;">
      <a-select ref="select" v-model:value="state" style="height: 28px;margin-right: 10px;width: 80px;" 
          @change="getAlarmLevel" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <a-select-option :value="item.value" v-for="(item, i) in deviceStateList">{{
            item.label }}</a-select-option>
        </a-select>
       <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
    </div>
    </template>
    <div class="chart">
      <pieGuidance :showLegend="false" :y-data="yData"></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import pieGuidance from "../../public/charts/pie/pie-guidance.vue"
import { collectConfigList, projectStatCategory } from '@/api/energy'
import { ModelValueItf } from '../../public/types'
import DateInlineForm from "../../public/dateInlineForm.vue";
interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '分项用能占比',
});
const state = ref('electricity_meter')
let timeFrame = ref<ModelValueItf>({timeType: 'THIS_MONTH'});
const deviceStateList = ref([])
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const yData = ref([
    { name: '在线', value: 5.6, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 1, itemStyle: { color: "#2AE8BD" } },
    { name: '关屏', value: 1, itemStyle: { color: "#ccc" } },
])
// 能耗分类配置
const getCollectConfigList = async () => {
 const res = await collectConfigList()
 deviceStateList.value = res.map(e=>{
  return {
    label:e.categoryName,
    value:e.categoryCode
  }
 })
 state.value = deviceStateList.value[0].value
}
const changeEnergyCarbonTime = async()=> {
}
const getAlarmLevel = async()=> {
  const params ={
    type:timeFrame.value.timeType,
    period:timeFrame.value.dateRange.join(","),
    projectCategory: 'ITEM',
    instrumentType:state.value
  }
  const res = await projectStatCategory(params)
  yData.value = res.map((e,i)=>{
    return {
      name:e.name,
      value:e.zhValue,
      itemStyle:{
        color:colors[i]
      }
    }
  })
}
onMounted(()=>{
  getCollectConfigList()
})
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>