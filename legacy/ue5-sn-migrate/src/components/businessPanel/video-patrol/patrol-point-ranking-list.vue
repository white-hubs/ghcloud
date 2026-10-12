<template>
      <SubPanelTemplate title="巡逻点位排行榜">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmTypeTime"
          @search="areaAlarmStatistic"
        ></DateInlineForm>
      </template>
     <div class="eventAlarmItem-box" v-show="areaAlarmRank.length > 0">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.name"
          :count="item.totalNum"
          :sn="false"
        />
      </div>
      <div style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '@/components/businessPanel/public/subPanelTemplate.vue';
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { ModelValueItf } from '../public/types'
import { cameraPatrolStatisticsPointTop } from "@/api/vmonitor";
const alarmTypeTime = ref<ModelValueItf>();
const areaAlarmRank = ref([])
const areaAlarmStatistic = async ()=>{
  areaAlarmRank.value = await cameraPatrolStatisticsPointTop({period:alarmTypeTime.value.dateRange.join(","),topSize:10})
}
</script>
<style lang="less" scoped>
.eventAlarmItem-box{
  height: 230px;
  overflow-y: auto
}
</style>