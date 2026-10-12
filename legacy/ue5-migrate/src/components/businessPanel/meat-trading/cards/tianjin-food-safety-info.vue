<template>
  <SubPanelTemplate title="食安信息">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="foodSafetyTime" @search="changeFoodSafetyTimeTime"></DateInlineForm>
    </template>
    <OperateDays :value="Operatevalue" title="来货报备批次总数"></OperateDays>
    <div class="chart">
      <barChart
        :colorLsit="['#98ACCD', '#D9E7FF']"
        :data="foodSafety.yData"
        :xData="foodSafety.xData"
        @barClick="handleBarClick"
      ></barChart>
    </div>
  </SubPanelTemplate>
  <modalUnqualifiedTable
    @close="closeUnqualifiedTable"
    :time-type="foodSafetyTime.timeType"
    :item-data="unqualifiedDataItem"
    :show-modal="showUnqualifiedTable"
  >
  </modalUnqualifiedTable>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import modalUnqualifiedTable from "../components/modal-unqualified-table.vue";
import { MeatTradeRankVO } from "@/api/models/slide";
import { meatTradeRank } from "@/api/slide-tianjin";
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
  xData: [],
});
const timeList = [
  { label: "今日", value: "TODAY" },
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];

const changeFoodSafetyTimeTime = () => {
  foodSafetyInformationEvent();
};

const foodSafetyInformationEvent = async () => {
  const data = await meatTradeRank({
    type: setTimeType(foodSafetyTime.value.timeType),
  });
  if (data.length) {
    Operatevalue.value = data[0].totalSum || 0;
  }
  const yData = [];
  const xData = [];
  data.forEach((item) => {
    yData.push({
      metadata: item,
      value: item.notPassSum,
      pop: item.notPassSumRate,
    });
    xData.push(item.meatTestingItemName);
  });
  Object.assign(foodSafety.yData[0].data, yData);
  foodSafety.xData = xData;
};

const showUnqualifiedTable = ref(false);
const unqualifiedDataItem = ref<MeatTradeRankVO>({
  id: "",
  timeRange: "",
  startDate: "",
  endDate: "",
  meatTestingItem: "",
  meatTestingItemCode: "",
  meatTestingItemName: "",
  totalCheckNumSum: 0,
  totalSum: 0,
  notPassSum: 0,
  prevTotalCheckNumSum: 0,
  prevTotalSum: 0,
  prevNotPassSum: 0,
  checkNumSumRate: 0,
  totalSumRate: 0,
  notPassSumRate: 0,
});

// 定义点击事件处理函数的类型
interface BarClickEvent {
  name: string;
  value: number;
  dataIndex: number;
  metadata: MeatTradeRankVO;
}

// 添加点击事件处理函数
const handleBarClick = (event: BarClickEvent): void => {
  unqualifiedDataItem.value = event.metadata;
  showUnqualifiedTable.value = true;
};
const closeUnqualifiedTable = () => {
  showUnqualifiedTable.value = false;
};
</script>

<style scoped lang="less">
.chart {
  margin-top: 20px;
  height: 200px;
}
</style>
