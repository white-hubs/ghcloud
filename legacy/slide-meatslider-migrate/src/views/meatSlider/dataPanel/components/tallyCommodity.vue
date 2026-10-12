<template lang="pug">
.tallyCommodity
    .tallyCommodity-title 理货商品明细
        .more(@click="toMore") 更多>
    .tallyCommodity-content 
        .tallyCommodity-btn
                a-button(:type="type==='TODAY'?'primary':null" @click="getList('TODAY')") 今天
                a-button(:type="type==='THIS_WEEK'?'primary':null" @click="getList('THIS_WEEK')") 本周
                a-button(:type="type==='THIS_MONTH'?'primary':null" @click="getList('THIS_MONTH')") 本月
                a-button(:type="type==='MONTH'?'primary':null" @click="getList('MONTH')") 近30天
        .tallyCommodity-chart
            .chart-statistics
                .chart-statistics-left 理货完成批次数
                    span {{data.reportArrangeTotal}}
                .chart-statistics-right 作弊嫌疑批次数
                    span {{data.reportSuspicionTotal}}
            .chart-table
                a-table(:dataSource="data.details" :columns="columns" :pagination="false"  size="middle"  :scroll="{ y: 400 }" :rowKey="'porkReportCode'")
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { useRouter } from "vue-router";
import { timeFormat, millennial } from "@/utils/common";
export default defineComponent({
  setup() {
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: {
        reportArrangeTotal: 0,
        reportSuspicionTotal: 0,
        total: 0,
        details: [],
      },
      type: "TODAY",
      columns: [
        {
          title: "理货机名称",
          dataIndex: "machineName",
          key: "machineName",
          slots: {
            customRender: "machineName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货批次",
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          slots: {
            customRender: "porkReportCode",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "商家名称",
          dataIndex: "supplierName",
          key: "supplierName",
          slots: {
            customRender: "supplierName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "商家编号",
          dataIndex: "supplierCode",
          key: "supplierCode",
          slots: {
            customRender: "supplierCode",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货片数",
          dataIndex: "porkArrangeSlices",
          key: "porkArrangeSlices",
          slots: {
            customRender: "porkArrangeSlices",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `${text}` : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货结果",
          dataIndex: "result",
          key: "result",
          slots: {
            customRender: "result",
          },
          customRender: ({ text }) => {
            if (text) {
              return <g-table-dot content="正常" />;
            } else {
              return <g-table-dot content="作弊嫌疑" status="delete" />;
            }
          },
        },
      ],
    });
    const getList = (type) => {
      state.type = type;
      proxy.$api
        .getPorkStatArrangeDetail({
          type: state.type,
          pageNumber: 1,
          pageSize: 10,
        },"get")
        .then((res) => {
          state.data = res;
        });
    };
    onMounted(() => {
      getList("TODAY");
    });
    const getAbs = (num) => {
      return Math.abs(num);
    };
    const toMore = () => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/tallyReasult`)
    };
    return {
      ...toRefs(state),
      getAbs,
      getList,
      toMore,
    };
  },
});
</script>
<style lang="less" scoped>
.tallyCommodity {
  margin-top: 16px;
  height: 610px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .tallyCommodity-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
    position: relative;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
    .more {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      right: 0;
      font-size: 14px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      cursor: pointer;
    }
  }
  .tallyCommodity-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .tallyCommodity-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      .ant-btn {
        margin-right: 10px;
      }
    }
    .tallyCommodity-chart {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      .chart-statistics {
        height: 60px;
        width: 100%;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        > div {
          width: calc(50% - 8px);
          font-size: 16px;
          font-family: Roboto-Regular, Roboto;
          font-weight: 400;
          color: #000000;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          > span {
            font-size: 24px;
            font-family: Roboto-Regular, Roboto;
            font-weight: 400;
          }
          &.chart-statistics-left {
            background: #e6fffb;
          }
          &.chart-statistics-right {
            background: #fff1f0;
          }
        }
      }
      .chart-table {
        flex: 1;
        width: 100%;
      }
    }
  }
}
</style>
