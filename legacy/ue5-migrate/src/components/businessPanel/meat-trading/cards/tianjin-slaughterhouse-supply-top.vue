<template>
  <whiteStripeTrading
    @getTime="exitEvent"
    @showMore="showMoreExit"
    :title="exitTop.title"
    :table-head="exitTop.tableHead"
    :areaAlarmRank="exitTop.areaAlarmRank"
  />
  <modalSupplyTable :showModal="showExitModal" :type="exitData" @close="closeExitModal" />
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import modalSupplyTable from "../components/modal-supply-table.vue";
import whiteStripeTrading from "../components/white-stripe-trading.vue";
import { porkBimStatAbattoir } from "@/api/slide-tianjin";

const exitData = ref("TODAY");
const showExitModal = ref(false);

const exitTop = reactive({
  title: "屠宰场供货TOP",
  tableHead: ["屠宰场名称", "片数", "来货重量(kg)"],
  areaAlarmRank: [],
});

const exitEvent = async (value) => {
  exitData.value = value;
  porkBimTop();
};

const showMoreExit = (item: any) => {
  showExitModal.value = true;
};

const closeExitModal = () => {
  showExitModal.value = false;
};

//  白条来货数据（TOP5）
const porkBimTop = async () => {
  let res = await porkBimStatAbattoir({ type: exitData.value, pageSize: 5 });
  exitTop.areaAlarmRank = res.records.map((item) => {
    return {
      alarmNum: item.supplyWeight,
      chainRatio: item.qoq,
      name: item.abattoirName,
      ratio: item.qoq, //占比不准确
      code: item.supplySlices,
      phone: item.supplySlices,
    };
  });
};
</script>

<style scoped lang="less"></style>
