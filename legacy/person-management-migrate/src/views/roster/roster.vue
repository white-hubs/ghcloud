<template>
  <a-table
    :title="pageTitle"
    :columns="columns"
    :api="api"
    :search="search"
    :btns="btns"
    tableCode="ROSTER"
    :rowSelection="rowSelection"
    :editMode="'page'"
    @slot="operation"
    ref="tableRef"
    class="staff-list"
  >
    <template #header-btns>
      <a-space>
        <a-button type="primary" @click="downloadTemplate" :loading="downLoading">下载模板</a-button>
        <a-button type="primary" @click="batchExport" :loading="exportLoading">批量导出</a-button>
        <a-upload
          :customRequest="customRequest"
          :showUploadList="false"
          :headers="{
            headers,
          }"
        >
          <a-button type="primary" :loading="importLoading"> 批量导入 </a-button>
        </a-upload>
      </a-space>
    </template>
    <template #btn="{ record }">
      <a-button v-if="hasPermission(permission.userPermission)" type="link" @click="handlePermission(record)"> 业务权限 </a-button>
    </template>
  </a-table>
  <a-modal v-model:visible="errorVisible" title="导入错误请检查..." :footer="null" width="800px">
    <Table :dataSource="errDataSource" :columns="errColumns" size="small" :pagination="false" />
  </a-modal>
</template>
<script lang="jsx">
import { message, Table } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { usePageName } from "@ghcloud/cube-utils";

import aTable from "./aTable.vue";
import { deptTree, downloadTemplateFile, batchStaffExport, importStaffTemplate, getStaffEnum } from "@/api/index";
import { appFunctionCodes } from "@/hooks/permission/index";
import { getNowEnterprise, getToken } from "@/utils/auth";
import { downloadExcel } from "@/utils/excel";
import { getRosterDerivedDisplayValue } from "@/utils/roster-derived";

export default defineComponent({
  components: { aTable, Table },
  setup() {
    const { pageTitle } = usePageName();
    const tableRef = ref();
    const errorVisible = ref(false);
    const errDataSource = ref([]);
    const router = useRouter();
    const permission = appFunctionCodes.userInfo;
    const headers = {
      tenant: getNowEnterprise()?.code,
      terminal: window.config?.terminal,
      Authorization: `Bearer ${getToken().accessToken}`,
    };
    const errColumns = [
      {
        title: "行号",
        dataIndex: "row",
        key: "row",
        width: 80,
      },
      {
        title: "列号",
        dataIndex: "column",
        key: "column",
        width: 80,
      },
      {
        title: "列名",
        dataIndex: "colName",
        key: "colName",
        width: 120,
      },
      {
        title: "提示信息",
        dataIndex: "msg",
        key: "msg",
      },
    ];
    const renderPlainValue = ({ text }) => {
      const display = text === null || text === undefined || text === "" ? "--" : text;
      return (
        <a-popover position="topLeft" content={display === "--" ? "" : String(display)}>
          {display}
        </a-popover>
      );
    };
    const renderDerivedValue = (field, record) => {
      return renderPlainValue({ text: getRosterDerivedDisplayValue(record, field) });
    };
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: `${KEYWORD_ALIAS.staff}姓名`,
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "jobNumber",
          title: `${KEYWORD_ALIAS.staff}工号`,
          slots: {
            customRender: "jobNumber",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "mobile",
          title: "联系电话",
          slots: {
            customRender: "mobile",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "maritalStatusName",
          title: "婚姻状况",
          slots: {
            customRender: "maritalStatusName",
          },
          ellipsis: true,
          customRender: renderPlainValue,
        },
        {
          dataIndex: "age",
          title: "年龄",
          slots: {
            customRender: "age",
          },
          ellipsis: true,
          customRender: ({ record }) => renderDerivedValue("age", record),
        },
        {
          dataIndex: "appointmentName",
          title: "岗位",
          slots: {
            customRender: "appointmentName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "postNames",
          title: "职位",
          slots: {
            customRender: "postNames",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "organizationName",
          title: "部门",
          slots: {
            customRender: "organizationName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "typeName",
          title: `${KEYWORD_ALIAS.staff}类型`,
          slots: {
            customRender: "typeName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "statusName",
          title: `${KEYWORD_ALIAS.staff}状态`,
          slots: {
            customRender: "statusName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "stateName",
          title: "工作状态",
          slots: {
            customRender: "stateName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "inductionDate",
          title: "入职时间",
          slots: {
            customRender: "inductionDate",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let time = text ? dayjs(text).format("YYYY-MM-DD") : null;
            return (
              <a-popover position="topLeft" content={time}>
                {time ? time : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "companyYears",
          title: "司龄",
          slots: {
            customRender: "companyYears",
          },
          ellipsis: true,
          customRender: ({ record }) => renderDerivedValue("companyYears", record),
        },
        {
          dataIndex: "planRegularWorkerDate",
          title: "计划转正日期",
          slots: {
            customRender: "planRegularWorkerDate",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const time = text ? dayjs(text).format("YYYY-MM-DD") : null;
            return (
              <a-popover position="topLeft" content={time}>
                {time ? time : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "workingYears",
          title: "工龄",
          slots: {
            customRender: "workingYears",
          },
          ellipsis: true,
          customRender: ({ record }) => renderDerivedValue("workingYears", record),
        },
        {
          dataIndex: "perfect",
          title: "资料完善",
          slots: {
            customRender: "perfect",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover position="topLeft" content={text ? "已完善" : "待完善"}>
                {text ? "已完善" : "待完善"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width: "180px",
          slots: {
            customRender: "action",
          },
        },
      ],
      importLoading: false,
      downLoading: false,
      exportLoading: false,
      api: {
        list: "getStaffPage",
        path: "/rosterOperate",
      },
      btns: ["detail", "add", "edit"],
      search: [
        {
          label: `${KEYWORD_ALIAS.staff}姓名`,
          value: "keyword",
          placeholder: "请输入",
        },
        {
          label: "所属部门",
          value: "organizationId",
          component: "a-tree-select",
          placeholder: "请选择",
          field: { children: "children", title: "title", key: "key", value: "value" },
          allowClear: true,
          showSearch: true,
          treeNodeFilterProp: "title",
        },
        {
          label: "资料完善",
          value: "archiveStatus",
          component: "aSelect",
          placeholder: "请选择",
          options: [
            { value: "WAITING_FOR_PERFECT", label: "待完善" },
            { value: "PERFECTED", label: "已完善" },
          ],
          field: { id: "value", name: "label" },
        },
        {
          label: `${KEYWORD_ALIAS.staff}类型`,
          value: "type",
          component: "aSelect",
          placeholder: "请选择",
          options: [],
        },
        {
          label: `${KEYWORD_ALIAS.staff}状态`,
          value: "status",
          component: "aSelect",
          options: [
            { label: "正式", value: "FORMAL" },
            { label: "离职", value: "LEAVE_OFFICE" },
            { label: "试用", value: "ON_TRIAL" },
          ],
          placeholder: "请选择",
        },
        { label: "", value: "keyword", placeholder: `请输入${KEYWORD_ALIAS.staff}姓名或工号` },
      ],
      rowSelection: false,
      btnStatus: "all",
    });
    const downloadTemplate = () => {
      state.downLoading = true;
      downloadTemplateFile().then((res) => {
        downloadExcel(res, "花名册模板");
        state.downLoading = false;
      });
    };
    const batchExport = () => {
      state.exportLoading = true;
      const params = {
        keyword: tableRef.value.form.keyword,
        organizationId: tableRef.value.form.organizationId,
        type: tableRef.value.form.type,
      };
      batchStaffExport(params)
        .then((res) => {
          downloadExcel(res, "花名册");
          state.exportLoading = false;
        })
        .catch((error) => {
          state.exportLoading = false;
        });
    };
    const customRequest = (fileObj) => {
      const formData = new FormData();
      formData.append("file", fileObj.file);
      state.importLoading = true;

      importStaffTemplate(formData)
        .then((res) => {
          if (res.data.length) {
            errorVisible.value = true;
            errDataSource.value = res.data;
          } else {
            message.success("导入成功");
          }
          state.importLoading = false;
        })
        .catch(() => {
          state.importLoading = false;
        });
    };
    const handlePermission = (data) => {
      router.push({ path: "/business-permissions", query: { mobile: data.mobile } });
    };
    const transformDep = (data) => {
      return data.map((item) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children && item.children.length > 0 ? transformDep(item.children) : undefined,
      }));
    };
    onMounted(() => {
      deptTree().then((res) => {
        state.search[1].options = transformDep(res.data);
      });
      getStaffEnum({ type: "staffType" }).then((res) => {
        state.search[3].options = res.data.map((item) => {
          return {
            value: item.value,
            label: item.name,
          };
        });
      });
    });

    return {
      ...toRefs(state),
      tableRef,
      downloadTemplate,
      batchExport,
      customRequest,
      errorVisible,
      errColumns,
      errDataSource,
      pageTitle,
      handlePermission,
      permission,
      hasPermission,
    };
  },
});
</script>
<style scoped lang="less">
.staff-list {
  :deep(.more-search) {
    display: none;
  }
}
</style>
