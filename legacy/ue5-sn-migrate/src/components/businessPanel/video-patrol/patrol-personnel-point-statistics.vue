<template>
  <SubPanelTemplate title="巡逻人员点位统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTypeTime" @search="areaAlarmStatistic"></DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '@/components/businessPanel/public/subPanelTemplate.vue';
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '../public/types'
import { cameraPatrolStatisticsCameraPointn } from '@/api/vmonitor'

const alarmTypeTime = ref<ModelValueItf>();
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [],
            name: '点位',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
    ]
})
const areaAlarmStatistic = async ()=>{
  const res = await cameraPatrolStatisticsCameraPointn({period:alarmTypeTime.value.dateRange.join(",")})
  barData.xData = res.map(e=>e.userName)
  barData.yData[0].data = res.map(e=>e.patrolCameraCount)
  
}
</script>
<style lang="less" scoped>
.chart{
  height: 220px;
}
</style>