<template>
  <SubPanelTemplate title="实时评价">
    <RollTable :column="column" :data="tableData"></RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";

import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const column = [
  {
    title: "评价时间",
    dataIndex: "evaluationTime",
  },
  {
    title: "评价人",
    dataIndex: "mobile",
    slots: {
      customRender: "mobile",
    },
    customRender: (text) => {
      return text.substr(0, 3) + "****" + text.substr(7);
    },
  },
  {
    title: "类型",
    dataIndex: "evaluationType",
    slots: {
      customRender: "evaluationType",
    },
    customRender: (text) => {
      return text === "0" ? "收件人" : "寄件人";
    },
  },
  {
    title: "评价分数",
    dataIndex: "evaluationAvg",
  },
];
const tableData = ref([]);

const getScoreList = () => {
  axios
    .post(
      "http://112.19.169.2:9090/evaluation/order/page",
      { curPage: 1, pageSize: 20 },
      {
        headers: {
          Authorization:
            "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
        },
      },
    )
    .then((res) => {
      tableData.value = res.data.data.records;
    });
};

onMounted(() => {
  getScoreList();
});
</script>

<style lang="less" scoped></style>
