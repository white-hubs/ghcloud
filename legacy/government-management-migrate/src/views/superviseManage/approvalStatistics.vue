<template>
  <statistics-table tableCode="APPROVAL_STATISTICS" :columns="columns" type="focusWork" :title="pageTitle"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import { ref } from "vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "姓名",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "部门",
    dataIndex: "deptName",
    key: "deptName",
  },
  {
    title: "发起次数",
    dataIndex: "applyNum",
    key: "applyNum",
  },
  {
    title: "审批通过次数",
    dataIndex: "passNum",
    key: "passNum",
  },
];
</script>
<style lang="less" scoped></style>
