<template>
  <statistics-table :columns="columns" type="recruit" tableCode="RECRUIT"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
const columns: TableColumnsType = [
  {
    title: "申请岗位",
    dataIndex: "postName",
    key: "postName",
    align: "center",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "增补人数",
    dataIndex: "num",
    key: "num",
    align: "center",
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
