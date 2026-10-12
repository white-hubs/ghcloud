<template>
  <SubPanelTemplate :title="title">
   <template #extra>
     <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
    </template>
    <div class="eventAlarmItem-body">
      <EventAlarmItem
        v-for="(item, index) in listData"
        :sort="index + 1"
        :sn="false"
        :name="item.name"
        :count="item.zhValue"
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
import { projectStatCategory } from '@/api/energy'
interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '区域综合能耗排名Top10',
});
let timeFrame = ref<ModelValueItf>({timeType: 'THIS_MONTH'});
const listData = ref<{ name: string; zhValue: number; }[]>([])

const getAlarmLevel = async()=> {
  const params = {
    type:timeFrame.value.timeType,
    period:timeFrame.value.dateRange.join(","),
    projectCategory: 'AREA'
  }
 const res = await projectStatCategory(params)
 res.sort((a,b)=>{
  return b.zhValue - a.zhValue
 })
 listData.value = res.slice(0, 10)
}
</script>
<style lang="less" scoped>
.eventAlarmItem-body{
  height: 200px;
  overflow-y: auto;
}
</style>