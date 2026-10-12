<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="收费对账"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :beforeGet="beforeGet"
    :search="search")
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();

    const endTime = route.query.endTime;
    const startTime = route.query.startTime;
    const laneCode = route.query.laneCode;
    const operateId = route.query.operateId;

    const state = reactive({
      columns: [
        {
          dataIndex: "plateNo",
          title: "车牌号",
          slots: {
            customRender: "plateNo",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "entryTime",
          title: "入场时间",
          slots: {
            customRender: "entryTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "exitTime",
          title: "出场时间",
          slots: {
            customRender: "exitTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "duration",
          title: "停车时间",
          slots: {
            customRender: "duration",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "parkingFee",
          title: "应收金额",
          slots: {
            customRender: "parkingFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "realFee",
          title: "实收金额",
          slots: {
            customRender: "realFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "discountFee",
          title: "免费金额",
          slots: {
            customRender: "discountFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payType",
          title: "支付方式",
          slots: {
            customRender: "payType",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "CASH":
                res = "现金";
                break;
              case "BALANCE":
                res = "钱包余额";
                break;
              case "ALI_PAY":
                res = "车卡支付";
                break;
              case "WEIXIN_PAY":
                res = "微信";
                break;
              case "IC_CARD":
                res = "车卡支付";
                break;
              default:
                res = "";
                break;
            }
            return (
              <PopOver position="topLeft" content={res ? res : ""}>
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "exitOperatorName",
          title: "收费操作员",
          slots: {
            customRender: "exitOperatorName",
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
          dataIndex: "entryLaneName",
          title: "收费车道",
          slots: {
            customRender: "entryLaneName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "entryAreaName",
          title: "收费区域",
          slots: {
            customRender: "entryAreaName",
          },
          ellipsis: true,
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
        list: "payRecord",
      },
      btns: [],
      search: [
        {
          label: "支付方式",
          value: "payType",
          component: "gSelect",
          options: [
            { label: "现金", value: "CASH" },
            { label: "微信", value: "WEIXIN_PAY" },
            { label: "支付宝", value: "ALI_PAY" },
            { label: "钱包余额", value: "BALANCE" },
            { label: "车卡支付", value: "IC_CARD" },
          ],
          url: "",
          placeholder: "请选择支付方式",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "收费人",
        },
        // {
        //   label: "",
        //   value: "startTime",
        //   component: "span",
        //   defaulValue: startTime,
        // },
        // {
        //   label: "",
        //   value: "endTime",
        //   component: "span",
        //   defaulValue: endTime,
        // },
        {
          label: "",
          value: "period",
          component: "span",
          defaulValue: `${startTime},${endTime}`,
        },
        {
          label: "",
          value: "laneCode",
          component: "span",
          defaulValue: laneCode,
        },
        {
          label: "",
          value: "operateId",
          component: "span",
          defaulValue: operateId,
        },
      ],
    });

    const beforeGet = (params) => {
      params.period = `${startTime},${endTime}`;
      params.laneCode = laneCode;
      return params;
    };

    onMounted(function(){});

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
      beforeGet,
    };
  },
});
</script>

<style lang="less" scoped>
.gridTop {
  width: 100%;
  height: 130px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
  .item {
    > div {
      flex: 1;
    }
  }
  .title,
  .value {
    font-size: 16px;
    font-weight: bold;
  }
}
.modalGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  span {
    display: inline-block;
    height: 32px;
    line-height: 1.5;
    &.title {
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
