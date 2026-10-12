<template>
    <SubPanelTemplate :title="props.title">
    <div class="event-alarm-item" v-show="areaAlarmRank.length > 0">
      <EventAlarmItem v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.deviceName"
        :count="item.value" :sn="false"/>
    </div>
    <div class="event-alarm-item" v-show="areaAlarmRank.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import { environmentalStatUePm } from '@/api/securitymanagement'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: 'PM2.5实时监测排行榜Top10'
})
const areaAlarmRank = ref([
])
const changeTopTimeFrame = async ()=>{
  const res = await environmentalStatUePm()
  areaAlarmRank.value = res.list
}
onMounted(()=>{
  changeTopTimeFrame()
})
</script>
<style lang="less" scoped>
.event-alarm-item{
  height: 250px;
  overflow-y: auto;
}
</style>