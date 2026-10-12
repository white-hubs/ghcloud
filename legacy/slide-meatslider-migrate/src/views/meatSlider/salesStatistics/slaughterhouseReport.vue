<template lang="pug">
g-table(
  title="屠宰场报表"
  :api="api"
  :btns="[]"
  :search="search"
  tableCode="SLAUGHTER_REPORT"
  :columns="columns"
  ref="tableRef"
)
  
</template>
<script lang="jsx">
import { orderStatus } from "@/utils/enumerate.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { millennial, getFreshLabel } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const dateFormat = "YYYY/MM/DD";
    const state = reactive({
      columns: [
        {
          dataIndex: "goodsCategoryName",
          key: "goodsCategoryName",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "abattoirName",
          key: "abattoirName",
          title: "屠宰场",
          slots: {
            customRender: "abattoirName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "tradeSlices",
          key: "tradeSlices",
          title: "交易片数",
          slots: {
            customRender: "tradeSlices",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "higherAmount",
          key: "higherAmount",
          title: "最高价",
          slots: {
            customRender: "higherAmount",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "lowerAmount",
          key: "lowerAmount",
          title: "最低价",
          slots: {
            customRender: "lowerAmount",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "averageAmount",
          key: "averageAmount",
          title: "交易均价",
          slots: {
            customRender: "averageAmount",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "actualAmount",
          key: "actualAmount",
          title: "实际交易均价",
          slots: {
            customRender: "actualAmount",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "dealWeight",
          key: "dealWeight",
          title: "成交重量",
          slots: {
            customRender: "dealWeight",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "dealAmount",
          key: "dealAmount",
          title: "成交金额",
          slots: {
            customRender: "dealAmount",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "commission",
          key: "commission",
          title: "佣金金额",
          slots: {
            customRender: "commission",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "getAbattoirStatPage",
      },
      search: [
        {
          label: "时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "屠宰场名称" },
      ],
      totalStatistics: null,
    });

    return {
      ...toRefs(state),
      tableRef,
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;

:deep(.ant-table) {
  & .ant-table-footer {
    border: none;
    top: -3px;
    left: 1px;
    .ant-table-fixed {
      // border: none;
      border-left: 1px solid #fafafa;
    }
  }
}
:deep(.ant-table-footer) {
  width: 100%;
  padding: 0;
  &::before {
    height: 0;
  }
}
:deep(.ant-table-content) {
  border-bottom: none;
}
:deep(.ant-table-footer .ant-table-thead) {
  display: none;
}
:deep(.ant-table-footer .ant-table-body) {
  font-family: @fontMedium;
  // margin-right: 15px;
  &::-webkit-scrollbar {
    // display: none;
    min-width: 18px;
    height: 0;
  }
}
.tableTotal {
  background-color: @white;
  border-top: 1px solid #eee;
}
.tableTotalName {
  font-family: @fontMedium;
  font-size: 16px;
  color: @fontColor;
  text-align: left;
  padding: 24px 0 8px 24px;
  background-color: @white;
}
.tableTotalData {
  display: grid;
  grid-template-columns: repeat(9, 10%);
  grid-column-gap: 1.25%;
  padding: 10px;
  margin: 0 8px;
  background-color: @tatalBgc;
  .itemData {
    color: @totalFontColor;
    font-size: 18px;
    font-family: @fontMedium;
    padding: 5px;
  }
  .itemName {
    font-family: @fontRegular;
    font-size: 14px;
    color: @fontColor;
    padding: 5px;
  }
}
</style>
