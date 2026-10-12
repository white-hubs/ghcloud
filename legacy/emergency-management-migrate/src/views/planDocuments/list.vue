<template>
  <g-table
    ref="tableData"
    :title="pageTitle"
    tableCode="EMERGENCY_CENTER_PLAN_FILE"
    :api="api"
    :columns="columns"
    :btns="btns"
    :search="search"
    editMode="custom"
    :scrollX="1000"
    :isShowMore="false"
    @operation="operationRecord"
  >
    <template #btn="{ record }">
      <a-button v-if="record.status === 'ACTIVE'" type="link" @click="launchPlan(record)"> 启动 </a-button>
      <a-button v-if="record.status === 'ACTIVE'" type="link" class="abolish-button" @click="abolishPlan(record)"> 废止 </a-button>
    </template>
  </g-table>
</template>

<script lang="jsx">
import { Modal } from "ant-design-vue";
import moment from "moment";
import { defineComponent, getCurrentInstance, onActivated, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";

import { usePageName } from "@ghcloud/cube-utils";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const { pageTitle } = usePageName();
    const router = useRouter();
    const tableData = ref(null);
    const levelDisplayMap = {
      IMPORTANT: { text: "重要", color: "red" },
      ORDINARY: { text: "普通", color: "blue" },
    };
    const statusDisplayMap = {
      DRAFT: { text: "草稿", color: "default" },
      APPROVING: { text: "审批中", color: "orange" },
      ACTIVE: { text: "已生效", color: "green" },
      ABOLISHED: { text: "已废止", color: "red" },
    };
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "planDocumentList",
        edit: "editPlanDocument",
        deleteSingle: "deleteDocumentDetail",
        path: "detail",
      },
      columns: [
        {
          dataIndex: "name",
          title: "文件名称",
          slots: {
            customrender: "name",
          },
          customRender: ({ text, record }) => {
            const name = text || (record.status === "DRAFT" ? "未命名预案" : "--");
            return <a-popover content={name}>{name}</a-popover>;
          },
        },
        // {
        //   dataIndex: "emergencyEventTypeName",
        //   title: "事件名称",
        //   slots: {
        //     customrender: "emergencyEventTypeName",
        //   },
        //   customRender: ({ text }) => {
        //     return (
        //       <a-popover content={text ? text : "--"}>
        //         {text ? text : "--"}
        //       </a-popover>
        //     );
        //   },
        // },
        {
          dataIndex: "emergencyFileTypeName",
          title: "文件类型",
          slots: {
            customrender: "emergencyFileTypeName",
          },
          customRender: ({ text }) => {
            return <a-popover content={text ? text : "--"}>{text ? text : "--"}</a-popover>;
          },
        },
        {
          dataIndex: "levelCode",
          title: "预案等级",
          slots: {
            customrender: "levelCode",
          },
          customRender: ({ text }) => {
            const display = levelDisplayMap[text];
            return display ? <a-tag color={display.color}>{display.text}</a-tag> : "--";
          },
        },
        {
          dataIndex: "expirationDate",
          title: "文件到期日期",
          slots: {
            customrender: "expirationDate",
          },
          customRender: ({ text }) => {
            const res = text ? moment(text).format("YYYY-MM-DD") : "--";
            return <a-popover content={res}>{res}</a-popover>;
          },
        },
        {
          dataIndex: "status",
          title: "预案状态",
          slots: {
            customrender: "status",
          },
          customRender: ({ text }) => {
            const display = statusDisplayMap[text];
            return display ? <a-tag color={display.color}>{display.text}</a-tag> : "--";
          },
        },
        {
          dataIndex: "generated",
          title: "创建来源",
          customRender: ({ text, record }) => {
            return record.contentHtml || text ? <a-tag color="blue">AI智能创建</a-tag> : <a-tag color="green">人工新建</a-tag>;
          },
        },
        {
          dataIndex: "remark",
          title: "备注说明",
          slots: {
            customrender: "remark",
          },
          customRender: ({ text }) => {
            return <a-popover content={text ? text : "--"}>{text ? text : "--"}</a-popover>;
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      search: [
        {
          label: "事件分类",
          value: "emergencyEventTypeCode",
          detailValue: "emergencyEventTypeCode",
          component: "gSelect",
          url: "geteventtypes",
          field: { name: "label", code: "value" },
          placeholder: "请选择事件分类",
        },
        {
          label: "预案等级",
          value: "levelCode",
          component: "gSelect",
          options: [
            { label: "重要", value: "IMPORTANT" },
            { label: "普通", value: "ORDINARY" },
          ],
          placeholder: "请选择预案等级",
          allowClear: true,
        },
        {
          label: "预案状态",
          value: "status",
          component: "gSelect",
          options: [
            { label: "草稿", value: "DRAFT" },
            { label: "审批中", value: "APPROVING" },
            { label: "已生效", value: "ACTIVE" },
          ],
          placeholder: "请选择预案状态",
          allowClear: true,
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入文件名",
        },
      ],
      btns: ["add", "detail", "edit", "deleteSingle"],
    });
    const operationRecord = (type, record) => {
      if (type === "detail") {
        router.push({ path: "/planDocument/detail", query: { type, id: record.id } });
        return;
      }
      if (type === "edit" && !["DRAFT", "ACTIVE"].includes(record.status)) {
        proxy.$message.warning("只有草稿或已生效预案可以编辑");
        return;
      }
      router.push({ path: "/planGenerate", query: { type, ...(record?.id ? { id: record.id } : {}) } });
    };
    const launchPlan = (record) => {
      router.push({ path: "/planEvent/launch", query: { planId: record.id } });
    };
    const abolishPlan = (record) => {
      Modal.confirm({
        title: `确认废止预案“${record.name}”？`,
        content: "废止后预案不可再被启动，但仍可在预案列表中查看历史版本。",
        okText: "确认废止",
        okType: "danger",
        cancelText: "取消",
        onOk: async () => {
          await proxy.$api.abolishPlanDocument(record.id);
          proxy.$message.success("预案已废止");
          tableData.value?.getData();
        },
      });
    };
    onActivated(() => {
      tableData.value?.getData();
    });
    return {
      ...toRefs(state),
      tableData,
      operationRecord,
      launchPlan,
      abolishPlan,
    };
  },
});
</script>

<style scoped>
.abolish-button {
  color: #faad14;
}
</style>
