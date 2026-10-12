<template>
  <statistics-table tableCode="REGULAR_STATISTICS" :columns="columns" type="regular"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
const columns: TableColumnsType = [
  {
    title: "所在部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "所在岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "转正人数",
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
