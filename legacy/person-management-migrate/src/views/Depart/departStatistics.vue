<template>
  <statistics-table tableCode="DEPART_STATISTICS" :columns="columns" type="depart"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
const columns: TableColumnsType = [
  {
    title: "离职岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "离职人数",
    dataIndex: "num",
    key: "num",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];

</script>
<style lang="less" scoped></style>
