<template>
  <div >
    <SubPanelTemplate title="梯控事件Top10">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="getPassengerFlowRegions"></DateInlineForm>
      </template>
      <div class="body" v-show="areaAlarmRank.length" style="min-height: 250px">
        <EventAlarmItem :sn="false" v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
         :count="item.value"/>
      </div>
      <div class="body" v-show="!areaAlarmRank.length" style="min-height: 250px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="可视对讲事件Top10">
      <template #extra>
        <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
      </template>
      <div class="body" v-show="intercomRank.length" style="min-height: 250px">
        <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.name"
         :count="item.value"/>
      </div>
      <div class="body" v-show="!intercomRank.length" style="min-height: 250px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import noData from "../public/noData.vue";
import { ModelValueItf } from '../public/types'
import { accessNameStat } from '@/api/door'

const handleTime = ref<ModelValueItf>()
const intercomTime = ref<ModelValueItf>()
const areaAlarmRank = ref([]);
const intercomRank = ref([]);
const getPassengerFlowRegions=async ()=>{
  areaAlarmRank.value = await accessNameStat({period:handleTime.value.dateRange.join(","),accessType:'TK'})
  
}
const getIntercomEvent=async ()=>{
  intercomRank.value = await accessNameStat({period:intercomTime.value.dateRange.join(","),accessType:'KSDJ'})
}

</script>
<style lang="less" scoped>
</style>