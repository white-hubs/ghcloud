<template>
  <SubPanelTemplate title="预约就诊分布">
    <template #extra>
      <DateInlineForm v-model:modelValue="appointmentTime" @search="getDistributionAppointmentVisits"></DateInlineForm>
    </template>
    <div class="appointment-data">
      <PlanPie :pieData="appointmentData">
        <img :src="getAssetsImage('business-icon/triage-queue-appointment.png')" />
      </PlanPie>
      <PieList :roundPieData="appointmentData"></PieList>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import { onMounted, ref } from 'vue';
import { ModelValueItf } from "../../public/types";
import { distributionAppointmentVisits } from '@/api/consultation-data'
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

/**
 * 预约就诊分布
 */
const appointmentTime = ref<ModelValueItf>();
const colorList = [
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]
const appointmentData = ref<{ label: string; value: number; color: string }[]>(
  []
);

const getDistributionAppointmentVisits=async()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: appointmentTime.value.dateRange.join(","),
    type: appointmentTime.value.timeType,
  };
let res=await distributionAppointmentVisits(params)
appointmentData.value=[]
res.distributionAppointmentVisit.forEach((item,index)=>{
  let obj = {
            label: item.subject,
            color: colorList[index],
            value: item.appointmentNum??0,
        };
        appointmentData.value.push(obj)
})
}
onMounted(() => {
  getDistributionAppointmentVisits()
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