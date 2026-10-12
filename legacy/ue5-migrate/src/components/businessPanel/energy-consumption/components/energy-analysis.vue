<template>
  <SubPanelTemplate title="用能分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="energyUsageTime" @search="changeAppointmentTime"></DateInlineForm>
    </template>
    <div class="flex-between analysis" v-for="item in energyAnalysis" :key="item.title">
      <PlanPie :pieData="item.data">
        <div class="content">
          <div>{{ item.title }}</div>
        </div>
      </PlanPie>
      <PieList class="pieList" :roundPieData="item.data"></PieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { projectStatCategory } from "@/api/energy";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const energyUsageTime = ref<any>();
const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
const energyAnalysis = ref([
  { data: [], title: "电力" },
  { data: [], title: "水" },
  { data: [], title: "燃气" },
]);

const changeAppointmentTime = async (): Promise<void> => {
  const params = {
    period: energyUsageTime.value.dateRange.join(","),
    type: energyUsageTime.value.timeType,
    projectCategory: "ITEM",
  } as any;
  const electricity: any = await projectStatCategory(Object.assign({}, params, { instrumentType: "electricity_meter" }));
  energyAnalysis.value[0].data = electricity.map((item: any, index: number) => ({
    label: item.name,
    value: item.value,
    color: colorList[index],
  }));
  const water: any = await projectStatCategory(Object.assign({}, params, { instrumentType: "water_meter" }));
  energyAnalysis.value[1].data = water.map((item: any, index: number) => ({
    label: item.name,
    value: item.value,
    color: colorList[index],
  }));
  const gasMeter: any = await projectStatCategory(Object.assign({}, params, { instrumentType: "gas_meter" }));
  energyAnalysis.value[2].data = gasMeter.map((item: any, index: number) => ({
    label: item.name,
    value: item.value,
    color: colorList[index],
  }));
};
</script>

<style scoped lang="less">
.analysis {
  .pieList {
    height: 100px;
    overflow-y: auto;
  }
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;
}
</style>
