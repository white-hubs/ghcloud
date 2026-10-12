<template>
  <SubPanelTemplate title="信息发布">
    <RollTable :column="column" :data="listData"></RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted } from "vue";

import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { playRecord } from "@/api/securitymanagement";

const column = reactive([
  {
    title: "信息名称",
    dataIndex: "itemName",
    width: 120,
  },
  {
    title: "发布时间",
    dataIndex: "startTime",
    width: 160,
  },
]);
const listData = ref([] as any[]);

const getPlayRecord = async () => {
  const res = await playRecord();
  listData.value = res.records;
  listData.value.forEach((item: any) => {
    item.startTime = dayjs(item.startTime).format("YYYY-MM-DD HH:mm:ss");
  });
};

onMounted(() => {
  getPlayRecord();
});
</script>

<style scoped lang="less"></style>
