<template>
      <SubPanelTemplate title="综合能耗分布">
            <template #extra>
                <DateInlineForm v-model:modelValue="appointmentTime" @search="changeAppointmentTime"></DateInlineForm>
            </template>
            <div class="flex-between">
                <PlanPie :pieData="monitorSituationPieData">
                    <div class="content">
                        <div class="total-num">{{ total }}</div>
                        <div>综合能耗</div>
                    </div>
                </PlanPie>
                <PieList :roundPieData="monitorSituationPieData"></PieList>
            </div>
        </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import { ModelValueItf } from '../../public/types'
import {  consumptionDistribution } from '@/mock/energy-consumption'

const appointmentTime = ref<ModelValueItf>();
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
  [
      { label: "电能", value: 30000, color: "#FFAB10" },
      { label: "水能", value: 2000, color: "#2F8DFF" },
      { label: "燃气", value: 748, color: "#F14545" },
      { label: "蒸汽", value: 6000, color: "#19F8F7" },
  ]
);
const total = ref(0)

const changeAppointmentTime = (): void => {
    // TODO (张正) 接口调用
    const { timeType } = appointmentTime.value
    monitorSituationPieData.value = consumptionDistribution(timeType)
    const appointmentTotalNum = monitorSituationPieData.value?.reduce(function (total, value) {
        return total + value.value;
    }, 0);
    total.value = 0
    monitorSituationPieData.value = monitorSituationPieData.value?.map(e => {
        total.value += e.value
        return {
            ...e,
            label: e.label + `（${(e.value / appointmentTotalNum * 100).toFixed(2)}%）`
        }
    })
}
</script>
<style lang="less" scoped>
.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
        font-size: 16px;
    }
}
</style>