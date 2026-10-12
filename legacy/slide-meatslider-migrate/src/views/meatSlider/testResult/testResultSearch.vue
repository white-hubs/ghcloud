<template lang="pug">
g-table(
  title="抽检结果查询"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="TEST_RESULT_SEARCH"
  :editMode="editMode" 
  :api="api" 
  ref="tableRef")   
  template(v-slot:btn="item")
    a-space(:size="16")
      a(@click="edit(item.record,'edit')" v-if="item.record.mark") 修改
      a(v-else disabled) 修改
      a(@click="edit(item.record,'detail')") 详情
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
// import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      columnList: [
        "supplierName",
        "supplierCode",
        "goodsCategoryName",
        "porkReportCode",
        "porkReportSlices",
        "requiredCheckRatio",
        "requiredCheckSlices",
        "actualCheckSlices",
        "clenbuterol",
        "watered",
        "result",
        "inspectorName",
        "spotCheckTime",
        "remark",
        "action",
      ],
      columns: [
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          width: 200,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.riskLevel === "MEDIUM") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="orange">中风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else if (record.riskLevel === "HIGH") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="red">高风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="green">低风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            }
          },
        },
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
          mark: "goodsCategoryName",
          dataIndex: "merchantVO.phone",
          key: "merchantVO.phone",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          // width: 90,
          customRender: ({ text, record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName: "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportCode",
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          title: "批次号",
          slots: {
            customRender: "porkReportCode",
          },
          // width: 80,
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
          mark: "porkReportSlices",
          dataIndex: "porkReportSlices",
          key: "porkReportSlices",
          title: "报备片数（片）",
          slots: {
            customRender: "porkReportSlices",
          },
          // width: 150,
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
          mark: "requiredCheckRatio",
          dataIndex: "requiredCheckRatio",
          key: "requiredCheckRatio",
          title: "抽检比例（%）",
          slots: {
            customRender: "requiredCheckRatio",
          },
          // width: 140,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportTickets",
          dataIndex: "porkReportTickets",
          key: "porkReportTickets",
          title: "报备检疫票数（张）",
          slots: {
            customRender: "porkReportTickets",
          },
          // width: 160,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `${millennial(Math.ceil(text / 2), false)}` : ""}
              >
                {text || text === 0
                  ? `${millennial(Math.ceil(text / 2), false)}`
                  : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "requiredCheckSlices",
          dataIndex: "requiredCheckSlices",
          key: "requiredCheckSlices",
          title: "规定抽检片数（片）",
          slots: {
            customRender: "requiredCheckSlices",
          },
          // width: 160,
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
          mark: "actualCheckSlices",
          dataIndex: "actualCheckSlices",
          key: "actualCheckSlices",
          title: "实际抽检片数（片）",
          slots: {
            customRender: "actualCheckSlices",
          },
          // width: 160,
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
          mark: "clenbuterol",
          dataIndex: "clenbuterol",
          key: "clenbuterol",
          title: "瘦肉精",
          slots: {
            customRender: "clenbuterol",
          },
          // width: 80,
          customRender: ({ text }) => {
            return text === "UNSELECTED" ? (
              <PopOver position="topLeft" content="检测中">
                检测中
              </PopOver>
            ) : text === "POSITIVE" ? (
              <PopOver position="topLeft" content="阳">
                <span style="color: red">阳</span>
              </PopOver>
            ) : (
              <PopOver position="topLeft" content="阴">
                阴
              </PopOver>
            );
          },
        },
        {
          mark: "watered",
          dataIndex: "watered",
          key: "watered",
          title: "含水量",
          slots: {
            customRender: "watered",
          },
          // width: 80,
          customRender: ({ text }) => {
            return text === "UNSELECTED" ? (
              <PopOver position="topLeft" content="检测中">
                检测中
              </PopOver>
            ) : text === "POSITIVE" ? (
              <PopOver position="topLeft" content="阳">
                <span style="color: red">阳</span>
              </PopOver>
            ) : (
              <PopOver position="topLeft" content="阴">
                阴
              </PopOver>
            );
          },
        },
        {
          mark: "result",
          dataIndex: "result",
          key: "result",
          title: "抽检结果",
          slots: {
            customRender: "result",
          },
          // width: 80,
          customRender: ({ text, record }) => {
            if (record.clenbuterol === "CHECKING" || record.watered === "CHECKING") {
              return (
                <PopOver position="topLeft" content="检测中">
                  检测中
                </PopOver>
              );
            } else if (
              record.clenbuterol === "POSITIVE" ||
              record.watered === "POSITIVE"
            ) {
              return (
                <PopOver position="topLeft" content="不合格">
                  <span class="deleteRow">不合格</span>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="合格">
                  合格
                </PopOver>
              );
            }
          },
        },
        {
          mark: "inspectorName",
          dataIndex: "inspectorName",
          key: "inspectorName",
          title: "抽检员",
          slots: {
            customRender: "inspectorName",
          },
          ellipsis: true,
          // width: 80,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "spotCheckTime",
          dataIndex: "spotCheckTime",
          key: "spotCheckTime",
          title: "抽检时间",
          slots: {
            customRender: "spotCheckTime",
          },
          // width: 180,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 140,
          fixed: "right",
        },
      ],
      editMode: "page",
      api: {
        list: "getGoodsSafety",
      },
      btns: [],
      search: [
        {
          label: "抽检时间",
          value: "date",
          defaultDate: "period",
          date: route.query.period ? route.query.period.split(",") : [],
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
        },
        {
          label: "",
          value: "status",
          defaultValue: "true",
          component: "span",
        },
        {
          label: "",
          value: "clenbuterol",
          defaultValue: route.query.clenbuterol
            ? route.query.clenbuterol
            : null,
          component: "span",
        },
        {
          label: "",
          value: "watered",
          defaultValue: route.query.watered ? route.query.watered : null,
          component: "span",
        },
      ],
    });

    onMounted(() => {
      // state.columns = tableColumns("goodsSafety", state.columnList);
    });

    const edit = (record, type) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/testResult?id=${boothId}&type=${type}`)
    };

    return {
      ...toRefs(state),
      edit,
    };
  },
});
</script>
<style scoped lang="less">
//:deep(.ant-badge) {
// height: 22px;
// line-height: 22px;
// position: absolute;
// top: -15px;
//  left: -5px;
//}
</style>
