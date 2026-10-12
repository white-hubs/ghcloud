<template lang="pug">
g-table(
  title="进场统计"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="[]"
)
  template(#content-data)
    .data-statistics
      .data-item-1.m1
        .data-money {{statistics?.totalWeight || statistics?.totalWeight === 0 ? millennial(statistics?.totalWeight):'0'}}
        .data-label 来货总重量(kg)
      .data-item-2.m1
        .data-money {{statistics?.totalFee || statistics?.totalFee === 0 ? millennial(statistics?.totalFee):'0'}}
        .data-label 缴费总金额(元)
      .data-item-3.m1
        .data-money {{statistics?.carNum || statistics?.carNum === 0 ? millennial(statistics?.carNum,false):'0'}}
        .data-label 来货车次(次)
      .data-item-4.m1
        .data-money {{statistics?.merchantNum || statistics?.merchantNum === 0 ? millennial(statistics?.merchantNum,false) : '0'}}
        .data-label 商家总数(户)

</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "enterStatisticsTable",
      },
      columns: [
        {
          title: "报备号",
          dataIndex: "reportCode",
          slots: {
            customRender: "reportCode",
          },
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
          title: "车道",
          dataIndex: "areaName",
        },
        {
          title: "商家名称",
          dataIndex: "merchantName",
          slots: {
            customRender: "merchantName",
          },
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
          title: "报备人",
          dataIndex: "reporterName",
          slots: {
            customRender: "reporterName",
          },
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
          title: "收费规则",
          dataIndex: "ruleCategoryName",
          slots: {
            customRender: "ruleCategoryName",
          },
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
          title: "商品重量（kg）",
          dataIndex: "netWeight",
          slots: {
            customRender: "netWeight",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? millennial(text) : ""}
              >
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "缴费金额",
          dataIndex: "enterFee",
          slots: {
            customRender: "enterFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? millennial(text) : ""}
              >
                {text ? "￥" + millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "进场时间",
          dataIndex: "enterTime",
          slots: {
            customRender: "enterTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, false) : ""}
              >
                {text ? timeFormat(text, false) : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [
        {
          label: "车道",
          value: "enterAreaId",
          component: "g-cascader",
          placeholder: "请选择",
          url: "passWayTag",
          params: { tag: "ENTER_CHARGE" },
        },
        {
          label: "时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "商家名称/报备号" },
      ],
      statistics: null,
    });

    const getStatisticsData = async () => {
      state.statistics = await proxy.$api.enterStatistics(null,"get");
    };

    onMounted(() => {
      getStatisticsData();
    });

    return {
      ...toRefs(state),
      millennial,
    };
  },
});
</script>
<style lang="less" scoped>
.data-statistics {
  height: 100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  > div {
    width: 30%;
    height: 100%;
    background: bisque;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;
    border-radius: 4px;
    &.data-item-1 {
      background: #f8fffd;
    }
    &.data-item-2 {
      background: #fffbf8;
    }
    &.data-item-3 {
      background: #f8fcff;
    }
    &.data-item-4 {
      background: #fffbf8;
    }
    > div {
      width: 100%;
      &.data-money {
        font-size: 14px;
        font-weight: 600;
        color: #535b6c;
      }
      &.data-label {
        font-size: 14px;
        font-weight: 400;
        color: #535b6c;
      }
    }
  }
}
</style>
