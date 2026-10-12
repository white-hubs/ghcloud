<template lang="pug">
g-table(
  title="销售统计"
  :api="api"
  :btns="[]"
  :search="search"
  :columns="columns"
  tableCode="SALES_STATISTICS"
  ref="tableRef"
)
  //- template(#content-data)
  //-   a-spin(:spinning="loading")
  //-         div.tableTotal()
  //-           div.tableTotalData
  //-             div
  //-               div.itemData {{totalStatistics?.highestPrice? millennial(totalStatistics?.highestPrice):'--'}}
  //-               div.itemName 最高价（元） 
  //-             div
  //-               div.itemData {{totalStatistics?.lowerPrice? millennial(totalStatistics?.lowerPrice):'--'}} 
  //-               div.itemName 最低价(元) 
  //-             div
  //-               div.itemData {{totalStatistics?.averagePrice? millennial(totalStatistics?.averagePrice):'--'}}
  //-               div.itemName 平均价(元) 
  //-             div
  //-               div.itemData {{totalStatistics?.porkArrangeSlices? millennial(totalStatistics?.porkArrangeSlices,false):'--'}}
  //-               div.itemName 理货片数(片) 
  //-             div
  //-               div.itemData {{totalStatistics?.dealSlices? millennial(totalStatistics?.dealSlices,false):'--'}}
  //-               div.itemName 成交片数(片)
  //-             div
  //-               div.itemData {{totalStatistics?.porkArrangeWeight? millennial(totalStatistics?.porkArrangeWeight):'--'}}
  //-               div.itemName 理货重量(kg) 
  //-             div
  //-               div.itemData {{totalStatistics?.dealWeight? millennial(totalStatistics?.dealWeight):'--'}}
  //-               div.itemName 成交重量(kg)
  //-             div
  //-               div.itemData {{totalStatistics?.amount? millennial(totalStatistics?.amount):'--'}}
  //-               div.itemName 成交金额(元)
  //-             div
  //-               div.itemData {{totalStatistics?.commission? millennial(totalStatistics?.commission):'--'}}
  //-               div.itemName 佣金金额(元)
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
      columnList: [
        "supplierCode",
        "supplierName",
        "goodsCategoryName",
        "highestPrice",
        "lowerPrice",
        "averagePrice",
        "porkArrangeSlices",
        "dealSlices",
        "porkArrangeWeight",
        "dealWeight",
        "amount",
        "commission",
      ],
      columnAllList: [
        "all",
        "empty",
        "empty",
        "highestPrice",
        "lowerPrice",
        "averagePrice",
        "porkArrangeSlices",
        "dealSlices",
        "porkArrangeWeight",
        "dealWeight",
        "amount",
        "commission",
      ],
      columns: [
        {
          mark: "supplierCode",
          dataIndex: "supplierCode",
          key: "supplierCode",
          title: "商家编号",
          slots: {
            customRender: "supplierCode",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },

        {
          mark: "goodsCategoryName",
          dataIndex: "porkReportVO.code",
          key: "goodsCategoryName",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          // width: 90,
          ellipsis: true,
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
          mark: "highestPrice",
          dataIndex: "highestPrice",
          key: "highestPrice",
          title: "最高价",
          slots: {
            customRender: "highestPrice",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
        },
        {
          mark: "lowerPrice",
          dataIndex: "lowerPrice",
          key: "lowerPrice",
          title: "最低价",
          slots: {
            customRender: "lowerPrice",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
        },
        {
          mark: "averagePrice",
          dataIndex: "averagePrice",
          key: "averagePrice",
          title: "平均价",
          slots: {
            customRender: "averagePrice",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
        },
        {
          mark: "porkArrangeSlices",
          dataIndex: "porkArrangeSlices",
          key: "porkArrangeSlices",
          title: "理货片数（片）",
          slots: {
            customRender: "porkArrangeSlices",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          // width: 130,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `${millennial(text, false)}` : ""}
              >
                {text || text === 0 ? `${millennial(text, false)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "dealSlices",
          dataIndex: "dealSlices",
          key: "dealSlices",
          title: "成交片数（片）",
          slots: {
            customRender: "dealSlices",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          // width: 130,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `${millennial(text, false)}` : ""}
              >
                {text || text === 0 ? `${millennial(text, false)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkArrangeWeight",
          dataIndex: "porkArrangeWeight",
          key: "porkArrangeWeight",
          title: "理货重量（kg）",
          slots: {
            customRender: "porkArrangeWeight",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          // width: 140,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "dealWeight",
          dataIndex: "dealWeight",
          key: "dealWeight",
          title: "成交重量（kg）",
          slots: {
            customRender: "dealWeight",
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
          // width: 140,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "成交金额",
          slots: {
            customRender: "amount",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
        }, {
          mark: "commission",
          dataIndex: "commission",
          key: "commission",
          title: "佣金金额",
          slots: {
            customRender: "commission",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          sorter: true,
          sortDirections: ["ascend", "descend"],
        }
      ],
      api: {
        list: "statistics",
      },
      search: [
        {
          label: "时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "商家名称/商家编号" },
      ],
      totalStatistics: null,
    });

    onMounted(() => {
      // state.columns = tableColumns("salesStatistics", state.columnList);
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
}</style>
