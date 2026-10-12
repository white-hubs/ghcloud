<template lang="pug">
g-table(
  title="车卡管理"
  :columns="columns"
  :btns="btns"
  :api="api"
  :scrollX="600"
  :search="search"
  :modal="modal"
  :rules="rules")
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { millennial, timeFormat, dateAdd } from "@/utils/common";
import moment from "moment";
export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "车卡名称",
          slots: {
            customRender: "name",
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
          dataIndex: "price",
          title: "车卡金额",
          slots: {
            customRender: "price",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? millennial(text, true) : ""}
              >
                {text ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "num",
          title: "购卡车辆数",
          slots: {
            customRender: "num",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, false) : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "effectiveNum",
          title: "购卡有效车辆数",
          slots: {
            customRender: "effectiveNum",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, false) : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
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
        },
      ],
      api: {
        list: "vehicleCard",
        add: "vehicleCardAdd",
        edit: "vehicleCardId",
        deleteSingle: "vehicleCardId",
        detail: "record",
      },
      btns: ["add", "edit", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: " 车卡名称",
        },
      ],
      modal: [
        {
          label: "车卡名称",
          value: "name",
          placeholder: "请输入车卡名称",
          maxlength: 20,
        },
        {
          label: "车卡时间",
          value: "duration",
          placeholder: "请选择车卡时间",
          component: "gSelect",
          options: [
            { label: "一个月", value: 1 },
            { label: "二个月", value: 2 },
            { label: "三个月", value: 3 },
            { label: "四个月", value: 4 },
            { label: "五个月", value: 5 },
            { label: "六个月", value: 6 },
            { label: "七个月", value: 7 },
            { label: "八个月", value: 8 },
            { label: "九个月", value: 9 },
            { label: "十个月", value: 10 },
            { label: "十一个月", value: 11 },
            { label: "十二个月", value: 12 },
          ],
        },
        {
          label: "车卡金额",
          value: "price",
          placeholder: "请输入车卡金额",
          component: "a-input-number",
          style: {
            width: "100%",
          },
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入车卡名称" }],
        duration: [{ required: true, message: "请输入车卡时间" }],
        price: [
          { required: true, message: "请输入车卡金额" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的金额(最多两位小数)",
          },
        ],
      },
    });

    onMounted(function(){});

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped></style>
