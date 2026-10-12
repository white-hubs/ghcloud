<template>
  <statistics-table tableCode="EXCHANGE_STATISTICS" :columns="columns" type="focusWorkChange" :title="pageTitle"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "部门",
    dataIndex: "deptName",
    key: "deptName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "督办事项",
    dataIndex: "focusWorkName",
    key: "focusWorkName",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "变更次数",
    dataIndex: "applyNum",
    key: "applyNum",
  },
  {
    title: "中止次数",
    dataIndex: "stopNum",
    key: "stopNum",
  },
  {
    title: "延期次数",
    dataIndex: "delayNum",
    key: "delayNum",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
];
</script>
<style lang="less" scoped></style>
