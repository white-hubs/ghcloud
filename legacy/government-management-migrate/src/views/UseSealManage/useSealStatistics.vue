<template>
    <statistics-table
      tableCode="USE_SEAL"
      :columns="columns"
      detailParam="sealId"
      type="seal"
      :title="pageTitle"
    ></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "申请印章",
    dataIndex: "sealName",
    key: "sealName",
  },
  {
    title: "申请人数",
    dataIndex: "applicantNum",
    key: "applicantNum",
  },
  {
    title: "申请次数",
    dataIndex: "applyNum",
    key: "applyNum",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];


</script>
<style lang="less" scoped>
</style>
