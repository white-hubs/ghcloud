<template>
  <statistics-table tableCode="WORK_SHIFT_STATISTICS" :columns="columns" type="workshift"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
const columns: TableColumnsType = [
  {
    title: "拟轮岗部门",
    dataIndex: "rotationOrganizationName",
    key: "rotationOrganizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "现所在部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "轮岗人数",
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
