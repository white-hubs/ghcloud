<template>
  <SubPanelTemplate title="食安信息">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="foodSafetyTime" @search="changeFoodSafetyTimeTime"></DateInlineForm>
    </template>
    <OperateDays :value="Operatevalue" title="来货报备批次数"></OperateDays>
    <div class="chart">
      <barChart :colorLsit="['#98ACCD', '#D9E7FF']" :data="foodSafety.yData" :xData="foodSafety.xData"></barChart>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { spotCheck } from "@/api/slide";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";

const foodSafetyTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});
const Operatevalue = ref<number>();
const foodSafety = reactive<any>({
  yData: [
    {
      color: "#D9E7FF",
      data: [],
      name: "不合格数量",
      showBackground: true,
      backgroundStyle: { color: "#6C8097" },
      labelFalge: true,
    },
  ],
  xData: ["检疫票", "瘦肉精", "含水量"],
});
const timeList = [
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];

const changeFoodSafetyTimeTime = () => {
  foodSafetyInformationEvent();
};

const foodSafetyInformationEvent = async () => {
  const data = await spotCheck({
    type: setTimeType(foodSafetyTime.value.timeType),
  });
  Operatevalue.value = data.supplyReports;
  Object.assign(foodSafety.yData[0].data, [
    {
      value: data.pratiqueFailed,
      pop: data.qoqPratiqueFailed,
    },
    {
      value: data.clenbuterolFailed,
      pop: data.qoqClenbuterolFailed,
    },
    {
      value: data.watered,
      pop: data.qoqWatered,
    },
  ]);
  foodSafety.xData = ["检疫票", "瘦肉精", "含水量"];
};
</script>

<style scoped lang="less">
.chart {
  margin-top: 20px;
  height: 200px;
}
</style>
