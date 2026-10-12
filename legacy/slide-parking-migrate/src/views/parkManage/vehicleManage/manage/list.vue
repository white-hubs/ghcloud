<template lang="pug">
g-table(
  title="车辆列表"
  :editMode="'page'"
  :columns="columns"
  :btns="btns"
  :api="api"
  :search="search")
  template(#header-btns)
    a-button(type="primary" @click="goPage('add')") 新增
  template(v-slot:btn="{record}")
    a-button(type="link" :disabled="record.cardStatus === 'INVALID'" @click="goPage('delay',record)") 延期
    a-button(type="link" :disabled="record.cardStatus === 'EFFECTIVE'" @click="goPage('add',record)") 购卡
</template>

<script lang="jsx">
import { getCurrentInstance, defineComponent, reactive, toRefs } from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          dataIndex: "carOwnerName",
          title: "车主姓名",
          slots: {
            customRender: "carOwnerName",
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
          dataIndex: "phone",
          title: "手机号",
          slots: {
            customRender: "phone",
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
          title: "车辆类型",
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
          dataIndex: "cardName",
          title: "车卡类型",
          slots: {
            customRender: "cardName",
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
          dataIndex: "plateNo",
          title: "车牌号",
          slots: {
            customRender: "plateNo",
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
          dataIndex: "startTime",
          title: "起始时间",
          slots: {
            customRender: "startTime",
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
          dataIndex: "endTime",
          title: "结束时间",
          slots: {
            customRender: "endTime",
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
          dataIndex: "cardStatus",
          title: "车卡状态",
          slots: {
            customRender: "cardStatus",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? (text === "EFFECTIVE" ? "有效" : "失效") : ""}
              >
                <g-table-dot
                  content={text === "EFFECTIVE" ? "有效" : "失效"}
                  status={text === "EFFECTIVE" ? "normal" : "audit"}
                />
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payStatus",
          title: "缴费状态",
          slots: {
            customRender: "payStatus",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? (text === "PAID" ? "已缴" : "待缴") : ""}
              >
                <g-table-dot
                  content={text === "PAID" ? "已缴" : "待缴"}
                  status={text === "PAID" ? "normal" : "audit"}
                />
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 200,
        },
      ],
      api: {
        list: "vehicle",
        // path: "/parkVehOperate",
        path: "/parkVehDetail",
        deleteSingle: "vehicleId",
      },
      btns: ["detail", "deleteSingle"],
      search: [
        {
          label: "车辆类型",
          value: "carTypeId",
          component: "gSelect",
          url: "carTypeConfigList",
          params: {
            pageSize: 1000,
            pageNumber: 1,
          },
          field: { carTypeName: "label", id: "value" },
        },
        {
          label: "车卡类型",
          value: "cardId",
          component: "gSelect",
          url: "vehicleCard",
          params: {
            pageSize: 1000,
            pageNumber: 1,
          },
          field: { name: "label", id: "value" },
        },
        {
          label: "车卡状态",
          value: "cardStatus",
          component: "gSelect",
          options: [
            { label: "全部", value: " " },
            { label: "有效", value: "EFFECTIVE" },
            { label: "失效", value: "INVALID" },
          ],
          defaultValue: " ",
        },
        {
          label: "缴费状态",
          value: "payStatus",
          component: "gSelect",
          options: [
            { label: "全部", value: " " },
            { label: "已缴", value: "PAID" },
            { label: "待缴", value: "UNPAID" },
          ],
          defaultValue: " ",
        },
        {
          label: "车卡有效期",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车主姓名/手机号/车牌号",
        },
      ],
    });

    const goPage = (value, record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
        record ? `/portal/park/parkVehOperate?type=${value}&id=${record?.id}` : `/portal/park/parkVehOperate?type=${value}`
      )
    };

    return {
      ...toRefs(state),
      goPage,
    };
  },
});
</script>

<style lang="less" scoped></style>
