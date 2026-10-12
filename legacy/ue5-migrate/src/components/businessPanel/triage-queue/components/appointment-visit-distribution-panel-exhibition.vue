<template>
  <SubPanelTemplate title="预约就诊分布">
    <template #extra>
      <DateInlineForm v-model:modelValue="appointmentTime" @search="changeAppointmentTime"></DateInlineForm>
    </template>
    <div class="appointment-data">
      <PlanPie :pieData="appointmentChartData">
        <img :src="getAssetsImage('business-icon/triage-queue-appointment.png')" />
      </PlanPie>
      <PieList :roundPieData="appointmentListtData"></PieList>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "../../public/types";

/**
 * 预约就诊分布
 */
const appointmentTime = ref<ModelValueItf>();
const changeAppointmentTime = (): void => {
  // TODO (张正) 接口调用
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
    appointmentChartData.value[1].value = 1900
    appointmentChartData.value[2].value = 2048
    appointmentChartData.value[3].value = 2133
  }

  const appointmentTotalNum = appointmentChartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  appointmentListtData.value = appointmentChartData.value.map(e => {
    return {
      ...e,
      label: e.label + `（${(e.value / appointmentTotalNum * 100).toFixed(2)}%）`
    }
  })
}
const appointmentChartData = ref<{ label: string; value: number; color: string }[]>(
  [
    { label: '心内科', value: 70, color: '#FFAB10' },
    { label: '耳鼻喉科', value: 100, color: '#2F8DFF' },
    { label: '肠胃科', value: 100, color: '#F14545' },
    { label: '烧伤科', value: 100, color: '#19F8F7' },
    { label: '呼吸道科', value: 100, color: '#19F8F7' },
  ]
);
const appointmentListtData = ref<{ label: string; value: number; color: string }[]>([])

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
    }
  }, 1000*20)
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
</style>