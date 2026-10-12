<template>
  <SubPanelTemplate title="批次作弊嫌疑率">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="suspicionTime" @search="changesuspicionTime"></DateInlineForm>
    </template>
    <div class="chart">
      <pie :data="piedata"></pie>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import pie from "../components/pie.vue";
import { suspicion } from "@/api/slide";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";

const suspicionTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});

const timeList = [
  { label: "今日", value: "TODAY" },
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];

const piedata = ref([]);

const changesuspicionTime = () => {
  getsuspicion();
};

const getsuspicion = async () => {
  const data = await suspicion({ type: setTimeType(suspicionTime.value.timeType) });
  piedata.value = [
    {
      name: "",
      type: "pie",
      radius: [60, 80],
      center: ["50%", "50%"],
      data: [
        {
          value: data.suspicionNum,
          name: `有嫌疑（${data.suspicion}%）`,
          pop: data.qoqSuspicion,
          itemStyle: {
            color: "#FFAB10",
          },
        },
        {
          value: data.noDoubtNum,
          name: `无嫌疑（${data.noDoubt}%）`,
          pop: data.qoqNoDoubt,
          itemStyle: {
            color: "#58FAB6",
          },
        },
      ],
    },
  ];
};
</script>

<style scoped lang="less">
.chart {
  height: 220px;
}
</style>
