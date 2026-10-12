<template lang="pug">
g-table(
  title="手动开闸记录"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns")
</template>

<script lang='jsx'>
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import _ from "lodash";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import { millennial, timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const state = reactive({
      btns: [],
      api: {
        list: "openGateRecord",
      },
      columns: [
        {
          dataIndex: "reportCode",
          title: "报备号",
          slots: {
            customRender: "reportCode",
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
          dataIndex: "carNo",
          title: "车牌号",
          slots: {
            customRender: "carNo",
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
          dataIndex: "goods",
          title: "来货商品",
          slots: {
            customRender: "goods",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            // return (
            //   <PopOver
            //     position="topLeft"
            //     content={
            //       text && text.length ? text.map((item) => item.goodsName) : ""
            //     }
            //   >
            //     {text && text.length
            //       ? text.map((item) => item.goodsName).join("、")
            //       : "--"}
            //   </PopOver>
            // );
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
          title: "开闸时间",
          slots: {
            customRender: "updateTime",
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
          dataIndex: "updateOperator",
          title: "开闸操作员",
          slots: {
            customRender: "updateOperator",
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
          dataIndex: "enterAreaName",
          title: "开闸车道",
          slots: {
            customRender: "enterAreaName",
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
          dataIndex: "liftRodReason",
          title: "开闸原因",
          slots: {
            customRender: "liftRodReason",
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
      search: [
        {
          label: "车道",
          value: "enterAreaId",
          component: "gCascader",
          // url: "laneTree",
          url: "passWayTag",
          params: { tag: "ENTER_CHARGE" },
          placeholder: "请选择车道",
        },
        {
          label: "开闸时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: ["开始日期", "结束日期"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "报备号/车牌号/商品/操作员",
        },
      ],
      form: {},
    });

    onMounted(function(){});

    return {
      ...toRefs(state),
      millennial,
    };
  },
});
</script>

<style lang="less" scoped></style>
