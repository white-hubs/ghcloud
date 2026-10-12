<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="缴费记录"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :search="search")
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();
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
          title: "停车时长",
          slots: {
            customRender: "duration",
          },
          ellipsis: true,
          // customRender: ({ text }) => {
          //   return (
          //     <PopOver
          //       position="topLeft"
          //       content={text || text === 0 ? millennial(text, true) : ""}
          //     >
          //       {text || text === 0 ? millennial(text, true) : "--"}
          //     </PopOver>
          //   );
          // },
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
                {text || text === 0 ? millennial(text, true) : "--"}
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
                {text || text === 0 ? millennial(text, true) : "--"}
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
                {text || text === 0 ? millennial(text, true) : "--"}
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
                {res ? res : "--"}
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
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "exitLaneName",
          title: "收费车道",
          slots: {
            customRender: "exitLaneName",
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
          label: "车道",
          value: "laneId",
          component: "gCascader",
          url: "laneTreeNoEquip",
          placeholder: "请选择车道",
          params: {
            tenant: getNowEnterprise().code,
          },
        },
        {
          label: "出场时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "支付方式",
          value: "payType",
          component: "gSelect",
          options: [
            { label: "全部", value: "" },
            { label: "现金", value: "CASH" },
            { label: "余额", value: "BALANCE" },
            { label: "微信", value: "WECHANT" },
            { label: "免支付", value: "IC_CARD" },
          ],
          placeholder: "请选择支付方式",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车牌号/操作员",
        },
      ],
      visible: false,
      choseRecord: null,
    });

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
    };
  },
});
</script>

<style lang="less" scoped>
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
