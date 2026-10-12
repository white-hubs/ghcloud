<template>
  <statistics-table tableCode="APPRAISE_STATISTICS" :columns="columns" type="appraise"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'
const columns: TableColumnsType = [
  {
    title: "所在岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: `被考核${KEYWORD_ALIAS.staff}数`,
    dataIndex: "num",
    key: "num",
    customRender: ({ text }) => {
      return formatText(text);
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];

const formatText = (text: string | number | null) => {
  return typeof text === "number" ? text : "-";
};

</script>
<style lang="less" scoped></style>
