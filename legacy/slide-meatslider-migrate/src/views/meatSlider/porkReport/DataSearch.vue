<template lang="pug">
g-table(
  title="数据查询"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="DATA_SEARCH"
  :editMode="editMode" 
  :api="api" 
  ref="tableRef")
  template(v-slot:btn="item")
    a-button(@click.stop="copyRecord(item.record)" type="link") 复制
    a-button(@click.stop="details(item.record)" type="link") 详情

</template>
<script lang="jsx">
import { timeFormat, millennial } from "@/utils/common";
import { auditStatus } from "@/utils/enumerate";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import { Modal } from "ant-design-vue";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "supplierName",
        "supplierCode",
        "code",
        "reportSlices",
        "reportWeight",
        "auditTime",
        "stallName",
        "vehiclePlate",
        "pratiqueCode",
        "abattoirName",
        "reportStatus",
        "auditorName",
        "action",
      ],
      // columnList: [
      //   "merchantName",
      //   "merchantCode",
      //   "code",
      //   "reportSlices",
      //   "reportWeight",
      //   "auditTime",
      //   "stallName",
      //   "vehiclePlate",
      //   "pratiqueCode",
      //   "abattoirName",
      //   "reportStatus",
      //   "auditorName",
      //   "action",
      // ],
    columns:  [
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          width: 200,
          fixed: "left",
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
          fixed: "left",

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
          mark: "code",
          dataIndex: "code",
          key: "code",
          title: "报备单号",
          slots: {
            customRender: "code",
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
          mark: "vehiclePlate",
          dataIndex: "vehiclePlate",
          key: "vehiclePlate",
          title: "来货车辆",
          slots: {
            customRender: "vehiclePlate",
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
          mark: "reportSlices",
          dataIndex: "reportSlices",
          key: "reportSlices",
          title: "报备片数（片）",
          slots: {
            customRender: "reportSlices",
          },

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
        },
        {
          mark: "reportWeight",
          dataIndex: "reportWeight",
          key: "reportWeight",
          title: "报备重量（kg）",
          slots: {
            customRender: "reportWeight",
          },

          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "abattoirName",
          dataIndex: "abattoirName",
          key: "abattoirName",
          title: "屠宰场",
          slots: {
            customRender: "abattoirName",
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
          mark: "arrivedTime",
          dataIndex: "arrivedTime",
          key: "arrivedTime",
          title: "到达时间",
          slots: {
            customRender: "arrivedTime",
          },

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
          ellipsis: true,
        },
        {
          mark: "auditTime",
          dataIndex: "auditTime",
          key: "auditTime",
          title: "审核时间",
          slots: {
            customRender: "auditTime",
          },

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
          ellipsis: true,
        },
        {
          mark: "stallName",
          dataIndex: "stallName",
          key: "stallName",
          title: "档位号",
          slots: {
            customRender: "stallName",
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
          mark: "pratiqueCode",
          dataIndex: "pratiqueCode",
          key: "pratiqueCode",
          title: "检疫证号",
          slots: {
            customRender: "pratiqueCode",
          },

          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text.split(",") : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "auditorName",
          dataIndex: "auditorName",
          key: "auditorName",
          title: "操作员",
          slots: {
            customRender: "auditorName",
          },

          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text.split(",") : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "reportStatus",
          dataIndex: "status",
          key: "status",
          title: "审核状态",
          slots: {
            customRender: "status",
          },

          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "PASSED") {
              text = "已通过";
            } else if (text === "FAILED") {
              text = "不通过";
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
                        : text === "不通过"
                        ? "tableDotDelete"
                        : "tableDotAudit"
                    }
                  ></span>
                  <span class="tableStatus pl1">{text ? text : "--"}</span>
                </span>
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
          width: 100,
          fixed: "right",
        },
      ],
      api: {
        list: "getPorkReport",
        path: "/auditData",
        detail: "porkReportId",
      },
      search: [
        {
          label: "审核结果",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(auditStatus, {
            name: "label",
            value: "value",
          }),
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
          value: "isAudited",
          component: "span",
          defaultValue: true,
        },
        { label: "", value: "keyword", placeholder: "商家名称/商家编号" },
      ],
      btns: [],
      editMode: "page",
    });

    const details = (record) => {
      const dataId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/auditData?id=${dataId}&type=detail`)
    };
    const copyRecord = (record) => {
      const dataId = record?.id ? record.id : "";

      proxy.$api.porkReportId(dataId,"get" ).then((res) => {
        Modal.confirm({
          title: "信息确认",
          content: "是否复制当前数据用作创建新的报备审核?",
          centered: true,
          okText: "确定",
          cancelText: "取消",
          onOk() {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/addAuditData?id=${dataId}&type=edit`)
          },
          onCancel() {
          },

          class: "test",
        });
      });
    };
    onMounted(() => {
      state.columns[state.columns.length - 1].width = "150px";
    });

    return {
      ...toRefs(state),
      details,
      copyRecord,
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
