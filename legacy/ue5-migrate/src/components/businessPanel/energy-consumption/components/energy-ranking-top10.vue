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
    <div class="eventAlarmItem-body">
      <EventAlarmItem
        v-for="(item, index) in listData"
        :sort="index + 1"
        :sn="false"
        :name="item.name"
        :count="item.value"
        :modes="'次'"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import { ModelValueItf } from '../../public/types'
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import { collectConfigList, projectStatCategory } from '@/api/energy'
interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '区域用能排名Top10',
});
const state = ref('electricity_meter')
const deviceStateList = ref([])
let timeFrame = ref<ModelValueItf>({timeType: 'THIS_MONTH'});
const listData = ref<{ name: string; value: number; }[]>([])
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
const getAlarmLevel = async()=> {
  const params = {
    period:timeFrame.value.dateRange.join(","),
    instrumentType:state.value,
    projectCategory: 'AREA'
  }
  const res = await projectStatCategory(params)
  res.sort((a,b)=>{
    return b.value - a.value 
  })
  listData.value = res.slice(0, 10)
}
onMounted(()=>{
  getCollectConfigList()
})
</script>
<style lang="less" scoped>
.eventAlarmItem-body{
  height: 200px;
  overflow-y: auto;
}
</style>