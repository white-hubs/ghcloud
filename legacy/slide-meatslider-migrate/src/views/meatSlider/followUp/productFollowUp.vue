<template lang="pug">
g-table(
  title="供货商品跟进"
  editMode="page"
  :search="search"
  :btns="[]"
  :api="api"
  tableCode="PRODUCT_FOLLOW_UP"
  :rowKey="'porkReportCode'"
  :columns="columns"
)
  template(v-slot:btn="item")
    a-button(type="link" @click="clickDetail(item.record)") 详情    
</template>
<script lang="jsx">
import { examAuditStatus, examTallyAuditStatus } from "@/utils/enumerate";
import { flattenTree, timeFormat, millennial } from "@/utils/common.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  onMounted,
  ref,
} from "vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { tableColumns,getFreshLabel } from "@/utils/common";
export default defineComponent({
  setup() {
    const dateFormat = "YYYY/MM/DD";
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "supplierName",
        "supplierCode",
        "goodsCategoryName",
        "porkReportCode",
        "porkReportSlices",
        "porkReportWeight",
        "porkArrangeAuditStatus",
        "porkReportStatus",
        "action",
      ],
      // columnList: [
      //   "merchantName",
      //   "merchantCode",
      //   "goodsCategoryName",
      //   "porkReportCode",
      //   "porkReportSlices",
      //   "porkReportWeight",
      //   "porkArrangeAuditStatus",
      //   "porkReportStatus",
      //   "action",
      // ],
      columns: [
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
        }, {
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
        }, {
          mark: "goodsCategoryName",
          dataIndex: "goodsCategoryName",
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
        }, {
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
        }, {
          mark: "porkReportSlices",
          dataIndex: "porkReportSlices",
          key: "porkReportSlices",
          title: "报备片数（片）",
          slots: {
            customRender: "porkReportSlices",
          },
          width: 140,
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
        }, {
          mark: "porkReportWeight",
          dataIndex: "porkReportWeight",
          key: "porkReportWeight",
          title: "报备重量（kg）",
          slots: {
            customRender: "porkReportWeight",
          },
          width: 140,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "porkArrangeAuditStatus",
          dataIndex: "porkArrangeAuditStatus",
          key: "porkArrangeAuditStatus",
          title: "理货审核",
          slots: {
            customRender: "porkArrangeAuditStatus",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "PASSED") {
              text = "已通过";
            } else if (text === "FAILED") {
              text = "未通过";
            } else if (text === "AUDIT") {
              text = "待审核";
            } else {
              text = "--";
            }
            return (
              <PopOver position="topLeft" content={text}>
                <span>
                  <span
                    class={
                      text === "已通过"
                        ? "tableDotNormal"
                        : text === "未通过"
                          ? "tableDotDelete"
                          : "tableDotAudit"
                    }
                  ></span>
                  <span class="tableStatus pl1">{text ? text : "--"}</span>
                </span>
              </PopOver>
            );
          },
        }, {
          mark: "porkReportStatus",
          dataIndex: "porkReportStatus",
          key: "porkReportStatus",
          title: "报备审核",
          slots: {
            customRender: "porkReportStatus",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "PASSED") {
              text = "已通过";
            } else if (text === "FAILED") {
              text = "未通过";
            } else if (text === "RESCINDED") {
              text = "已撤销";
            } else {
              text = "待审核";
            }
            return (
              <PopOver position="topLeft" content={text}>
                <span>
                  <span
                    class={
                      text === "已通过"
                        ? "tableDotNormal"
                        : text === "未通过"
                          ? "tableDotDelete"
                          : "tableDotAudit"
                    }
                  ></span>
                  <span class="tableStatus pl1">{text ? text : "--"}</span>
                </span>
              </PopOver>
            );
          },
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width:100,
          fixed: "right",
        },
      ],
      api: {
        list: "getFollowUp",
        path: "/followUpDetails",
      },
      search: [
        {
          label: "报备审核",
          value: "porkReportStatus",
          component: "g-select",
          options: examAuditStatus,
          defaultValue: " ",
          placeholder: "请选择",
        },
        {
          label: "理货审核",
          value: "porkArrangeAuditStatus",
          component: "g-select",
          options: examTallyAuditStatus,
          defaultValue: " ",
          placeholder: "请选择",
        },
        {
          label: "报备时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
        },
      ],
    });

    onMounted(() => {
    });
    const clickDetail = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/followUpDetails?porkReportCode=${record.porkReportCode}`)
    };
    return {
      ...toRefs(state),
      clickDetail,
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;


:deep(.ant-form-item) {
  margin-bottom: 0;
}
</style>
