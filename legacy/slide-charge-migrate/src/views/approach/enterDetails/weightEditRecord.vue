<template lang="pug">
g-table(
  title="重量修改记录"
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
        list: "weightEditRecord",
      },
      columns: [
        {
          dataIndex: "updateOperator",
          title: "修改人",
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
          dataIndex: "enterTime",
          title: "进场时间",
          slots: {
            customRender: "enterTime",
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
          dataIndex: "enterAreaName",
          title: "车道",
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
          dataIndex: "carTypeName",
          title: "车型",
          slots: {
            customRender: "carTypeName",
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
          dataIndex: "oldConvertKg",
          title: "修改前毛重(kg)",
          slots: {
            customRender: "oldConvertKg",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text) : ""}
              >
                {text || text === 0 ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "newConvertKg",
          title: "修改后毛重(kg)",
          slots: {
            customRender: "newConvertKg",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text) : ""}
              >
                {text || text === 0 ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "oldConvertKgForNet",
          title: "修改前净重(kg)",
          slots: {
            customRender: "oldConvertKgForNet",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text) : ""}
              >
                {text || text === 0 ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "newConvertKgForNet",
          title: "修改后净重(kg)",
          slots: {
            customRender: "newConvertKgForNet",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text) : ""}
              >
                {text || text === 0 ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "weightRemark",
          title: "备注",
          slots: {
            customRender: "weightRemark",
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
          label: "进场时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: ["开始日期", "结束日期"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "报备号/修改人/车牌号/商品",
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
