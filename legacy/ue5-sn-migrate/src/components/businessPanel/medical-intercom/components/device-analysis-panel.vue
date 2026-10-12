<template>
  <SubPanelTemplate title="设备统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="appointmentTime" @search="changeAppointmentTime"></DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart" :style="{ height: px2rem(chartHeight + 'px') }">
        <elevator-analysis-pie :pieData="appointmentChartData">
          <div style="color: #fff;text-align: center;font-size: 14px;">{{ appointmentTotalNum }}</div>
          <div style="color: #fff;text-align: center;font-size: 14px;">设备总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="appointmentListtData" style="margin-left: 10px;width: 150px;">
      </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { px2rem } from '@/utils/common';

const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 220
})
/**
 * 设备统计
 */
const appointmentTotalNum = ref(334)
const appointmentTime = ref<ModelValueItf>();
const changeAppointmentTime = (): void => {
  // TODO  接口调用
  const { timeType } = appointmentTime.value
  if (timeType === 'TODAY') {
    appointmentChartData.value[0].value = 70
    appointmentChartData.value[1].value = 100
    appointmentChartData.value[2].value = 100
    appointmentChartData.value[3].value = 100
  } else if (timeType === 'THIS_WEEK') {
    appointmentChartData.value[0].value = 170
    appointmentChartData.value[1].value = 120
    appointmentChartData.value[2].value = 120
    appointmentChartData.value[3].value = 130
  } else if (timeType === 'THIS_MONTH') {
    appointmentChartData.value[0].value = 210
    appointmentChartData.value[1].value = 200
    appointmentChartData.value[2].value = 210
    appointmentChartData.value[3].value = 230
  } else if (timeType === 'THIS_YEAR') {
    appointmentChartData.value[0].value = 732
    appointmentChartData.value[1].value = 190
    appointmentChartData.value[2].value = 248
    appointmentChartData.value[3].value = 213
  }

  appointmentTotalNum.value = appointmentChartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  appointmentListtData.value = appointmentChartData.value.map(e => {
    return {
      ...e,
      ratio: `${(e.value / appointmentTotalNum.value * 100).toFixed(2)}%`
    }
  })
}
const appointmentChartData = ref<{ name: string; value: number; color: string; ratio?: string }[]>(
  [
    { name: '护士站主机', value: 70, color: '#FFAB10' },
    { name: '床头分机', value: 100, color: '#2F8DFF' },
    { name: '病房门口机', value: 100, color: '#F14545' },
    { name: '卫生间分机', value: 100, color: '#19F8F7' },
  ]
);
const appointmentListtData = ref<{ name: string; value: number; color: string; ratio?: string }[]>([])

let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    appointmentTime.value.timeType = fakeData[fakeIndex]
    changeAppointmentTime()
    fakeIndex++;
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0
      clearInterval(timer)
    }
  }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.appointment-data {
  display: flex;
  align-items: center;
  height: 100%;

  img {
    width: 20px;
    height: 20px;
  }

  :deep(.policeList) {
    display: flex;
    flex-flow: column;
    justify-content: center;

    .thePolice {
      margin-bottom: 6px;
      background: rgba(171, 177, 189, 0.12);

      .thePoliceLeft {
        overflow: visible;
      }
    }
  }
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 220px;
}
</style>