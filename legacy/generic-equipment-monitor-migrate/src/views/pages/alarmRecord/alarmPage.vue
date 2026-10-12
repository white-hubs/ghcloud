<template>
  <g-table
    ref="tableData"
    :title="pageTitle"
    :search="search"
    :api="api"
    :btns="btns"
    :isShowMore="false"
    :columns="columns"
    editMode="page"
    :beforeGet="beforeGet"
    :applicationCode="applicationCode"
    tableCode="alarm-record-list"
    :rowSelection="true"
    :preserveSelectedRowKeys="true"
  >
    <template #header-btns>
      <a-button v-if="isBatchHandleVisible" type="primary" :disabled="!canBatchHandle" @click="handleBatch"> 批量处理 </a-button>
      <a-popconfirm v-if="isDeletePermission && selectRowKeys?.length > 0" title="确定删除当前数据？" @confirm="handleBatchDelete">
        <a-button type="primary" :loading="batchDeleteLoading" danger>批量删除</a-button>
      </a-popconfirm>
      <a-button v-else-if="isDeletePermission" type="primary" disabled danger>批量删除</a-button>
    </template>
    <template #btn="{ record }">
      <!-- 线损管理：操作列仅保留 g-table 内置「详情」，不展示指派/挂起/处理 -->
      <template v-if="applicationCode !== 'LINE_LOSS_MANAGEMENT'">
        <a-button
          type="link"
          @click="transfer(record)"
          v-if="
            operateApps.includes(applicationCode)
              ? operatePermissions.includes('ASSIGN') &&
                (record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
                  record.alarmStatus === 'ALARM_SUSPEND' ||
                  record.alarmStatus === 'ALARM_UN_CONFIRMED')
              : record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
                record.alarmStatus === 'ALARM_SUSPEND' ||
                record.alarmStatus === 'ALARM_UN_CONFIRMED'
          "
        >
          指派
        </a-button>
        <a-button
          type="link"
          @click="suspend(record)"
          v-if="
            operateApps.includes(applicationCode)
              ? operatePermissions.includes('PENDING') && record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'
              : record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'
          "
        >
          挂起
        </a-button>
        <a-button
          type="link"
          @click="handle(record)"
          v-if="
            operateApps.includes(applicationCode)
              ? operatePermissions.includes('HANDLE') &&
                (record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
                  record.alarmStatus === 'ALARM_SUSPEND' ||
                  record.alarmStatus === 'ALARM_UN_CONFIRMED')
              : record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
                record.alarmStatus === 'ALARM_SUSPEND' ||
                record.alarmStatus === 'ALARM_UN_CONFIRMED'
          "
        >
          处理
        </a-button>
      </template>
    </template>
  </g-table>
  <modal-table
    title="选择人员"
    v-model:value="modal.visible"
    url="tenantUserList"
    :params="{ enabled: true }"
    :columns="modal.columns"
    :search="modal.search"
    :searchLength="3"
    :width="1300"
    selectType="checkbox"
    @modal-save="chengUser"
  ></modal-table>
  <handel-suspend ref="handelSuspendModal" :confirmLoading="confirmSuspendLoading" :width="560" @modal-save="saveSuspend"></handel-suspend>
  <HandleResult
    ref="handelResultModal"
    :confirmLoading="confirmHandleLoading"
    :applicationCode="applicationCode"
    :batchMode="handleMode === 'batch'"
    :width="560"
    @modal-save="saveHandel"
  >
  </HandleResult>
</template>
<script lang="jsx">
import moment from "moment";
import { computed, onMounted, defineComponent, getCurrentInstance, onBeforeMount, reactive, ref, toRefs } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { usePageName } from "@ghcloud/cube-utils";

import handelSuspend from "./components/handelSuspend.vue";
import HandleResult from "./components/handleResult.vue";
import { cubeAlarmCenterService } from "@/api/service";
import { cubeDictionaryService } from "@/api/service";
import { appFunctionCodes } from "@/permission";
import {
  alarmHandleEnumerate,
  alarmOvertimeEnumerate,
  alarmHandlerResultEnumerate,
  alarmHandleEnumeTimes,
  getAlarmHandleEnumeTimes,
} from "@/utils/enumerate";
import aTable from "@/views/pages/alarmConfig/aTable.vue";
const color = {
  一级: "rgb(255, 59, 52)",
  二级: "rgb(255, 110, 52)",
  三级: "rgb(255, 194, 52)",
  四级: "rgb(24, 144, 255)",
};
const status = {
  超时: "#D9001B",
  正常: "#70B603",
};
const workStatus = {
  REST: "休息",
  WORKING: "在岗",
  LEAVE_POST: "离岗",
  AWAY_BUSINESS: "出差",
  ASK_LEAVE: "请假",
};
const resultStatus = {
  ALARM_ACTUAL: "实报",
  ALARM_IMPRACTICAL: "误报",
};
const handStatus = {
  已挂起: "#02A7F0",
  待接收: "#D9001B",
  待确认: "#D9001B",
  处理中: "#e8b130",
  已关闭: "#7F7F7F",
  已处理: "#70B603",
};
export default defineComponent({
  components: { handelSuspend, HandleResult, aTable },
  setup() {
    const store = useStore();
    const applicationCode = ref(null);
    const { proxy } = getCurrentInstance();
    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const route = useRoute();
    const tableData = ref(null);
    const operatePermissions = ref();

    /** 线损管理应用：表头顺序与「预警列表」线损场景一致 */
    const createLineLossManagementColumns = () => {
      return [
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          align: "center",
          slots: { customRender: "alarmTime" },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "alarmTargetName",
          title: "线路名称",
          align: "center",
          slots: { customRender: "alarmTargetName" },
          customRender: ({ text }) => {
            return <span>{text || "--"}</span>;
          },
        },
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
          align: "center",
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          width: 80,
          align: "center",
          slots: { customRender: "alarmLevelName" },
          customRender: ({ text }) => {
            return <span style={{ color: color[text] }}>{text || "--"}</span>;
          },
        },
        {
          dataIndex: "alarmHandlerTimeoutStatusName",
          title: "超时状态",
          width: 80,
          align: "center",
          slots: { customRender: "alarmHandlerTimeoutStatusName" },
          customRender: ({ text }) => {
            return <span style={{ color: status[text] }}>{text ? text : "--"}</span>;
          },
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          width: 100,
          align: "center",
          slots: { customRender: "alarmStatusName" },
          customRender: ({ text }) => {
            return <span style={{ color: handStatus[text] }}>{text || "--"}</span>;
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
          width: 100,
          align: "center",
          slots: { customRender: "alarmHandlerName" },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width: 120,
          slots: { customRender: "action" },
        },
      ];
    };

    const usePersonalColumns = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      const personalColumns = [
        {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          slots: {
            customRender: "gender",
          },
          customRender: ({ text }) => {
            return text || "--";
          },
        },
        {
          title: "岗位",
          dataIndex: "postNames",
          key: "postNames",
          customRender: ({ text }) => {
            return text == "" ? "--" : text;
          },
        },
        {
          title: "是否在岗",
          dataIndex: "onDuty",
          key: "onDuty",
          customRender: ({ text }) => {
            return text ? "是" : "否";
          },
        },
      ];
      const ouaaColumns = [
        {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          slots: {
            customRender: "gender",
          },
          customRender: ({ text }) => {
            return text === "MALE" ? "男" : "女";
          },
        },
      ];
      return usePersonal ? personalColumns : ouaaColumns;
    };
    const usePersonalSearch = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      return usePersonal
        ? [
            {
              label: "是否在岗",
              value: "onDuty",
              component: "g-select",
              options: [
                { label: "是", value: true },
                { label: "否", value: false },
              ],
            },
          ]
        : [];
    };
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      btnStatus: "",
      api: {
        list: "getAlarmRecords",
        path: "/alarmDetail",
        pathParams: [{ value: "businessKey" }, { value: "alarmStatus" }],
      },
      confirmSuspendLoading: false,
      confirmHandleLoading: false,
      handleMode: "single",
      search: [],
      btns: ["detail"],
      columns: [
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
          align: "center",
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          width: 80,
          align: "center",
          slots: {
            customRender: "alarmLevelName",
          },
          customRender: ({ text, record, index }) => {
            return <span style={{ color: color[text] }}>{text || "--"}</span>;
          },
        },
        {
          dataIndex: "areaName",
          title: "报警区域",
          align: "center",
        },
        {
          dataIndex: "alarmTargetAddress",
          title: "详细位置",
          align: "center",
          slots: {
            customRender: "alarmTargetAddress",
          },
          customRender: ({ text, record, index }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          align: "center",
          slots: {
            customRender: "alarmTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "alarmTargetName",
          title: "报警设备",
          align: "center",
        },
        {
          dataIndex: "timeoutProcessTimesName",
          title: "处理时限",
          width: 100,
          align: "center",
          slots: {
            customRender: "timeoutProcessTimesName",
          },
          customRender: ({ text, record, index }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "alarmHandlerTimeoutStatusName",
          title: "超时状态",
          width: 80,
          align: "center",
          slots: {
            customRender: "alarmHandlerTimeoutStatusName",
          },
          customRender: ({ text, record, index }) => {
            return <span style={{ color: status[text] }}>{text ? text : "--"}</span>;
          },
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          width: 100,
          align: "center",
          slots: {
            customRender: "alarmStatusName",
          },
          customRender: ({ text, record }) => {
            return <span style={{ color: handStatus[text] }}>{text}</span>;
          },
        },
        {
          dataIndex: "alarmHandlerResult",
          title: "处理结果",
          width: 100,
          align: "center",
          slots: {
            customRender: "alarmHandlerResult",
          },
          customRender: ({ text }) => {
            return text ? resultStatus[text] : "--";
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
          width: 100,
          align: "center",
          slots: {
            customRender: "alarmHandlerName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width: 220,
          slots: {
            customRender: "action",
          },
        },
      ],
      selectedRow: {},
      modal: {
        visible: false,
        url: "",
        columns: [
          {
            title: "名称",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "联系电话",
            dataIndex: "mobile",
            key: "mobile",
          },
          {
            title: "性别",
            dataIndex: "gender",
            key: "gender",
            slots: {
              customRender: "gender",
            },
            customRender: ({ text }) => {
              const genderValues = {
                MALE: "男",
                FEMALE: "女",
                NONE: "保密",
              };
              return text ? genderValues[text] : "--";
            },
          },
          {
            title: "职位",
            dataIndex: "positions",
            key: "positions",
            slots: {
              customRender: "positions",
            },
            customRender: ({ text }) => {
              if (!text) return "--";
              if (!text.length) return "--";
              const positions = text.map((item) => item.name);
              return positions.join(",");
            },
          },
          {
            title: "工作状态",
            dataIndex: "workStatus",
            key: "workStatus",
            slots: {
              customRender: "workStatus",
            },
            customRender: ({ text }) => {
              return text ? workStatus[text] : "--";
            },
          },
          // ...usePersonalColumns(),
        ],
        search: [
          {
            label: "状态",
            value: "enabled",
            component: "g-select",
            options: [
              { label: "启用", value: true },
              { label: "禁用", value: false },
            ],
            field: { value: "value", label: "label" },
          },
          {
            label: "",
            value: "keyword",
            placeholder: "请输入人员名称",
          },
        ],
      },
      batchDeleteLoading: false,
    });
    const handelStatusColor = computed(() => (key) => {
      let obj = alarmHandleEnumerate.find((item) => item.value === key);
      if (obj) {
        return obj.color;
      } else {
        return "";
      }
    });
    const operateApps = ["ENERGY_CONSUMPTION"]; //有权限设置的应用
    onBeforeMount(async () => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"));
      });
      applicationCode.value = application.value.code;

      state.btnStatus = route.params.alarmStatus || "";
      state.search = [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称/报警事件",
          width: "150px",
        },
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
          width: "150px",
        },
        {
          label: "报警级别",
          value: "alarmLevelId",
          component: "g-select",
          url: "getAlarmLevels",
          field: { name: "label", id: "value" },
          placeholder: "请选择报警级别",
          width: "130px",
        },
        {
          label: "处理状态",
          value: "alarmStatus",
          component: "g-select",
          options: alarmHandleEnumerate,
          placeholder: "请选择处理状态",
          width: "130px",
        },
        {
          label: "处理结果",
          value: "alarmHandlerResult",
          component: "g-select",
          options: alarmHandlerResultEnumerate,
          placeholder: "请选择处理结果",
          width: "130px",
        },
        {
          label: "超时状态",
          value: "alarmHandlerTimeoutStatus",
          component: "g-select",
          options: alarmOvertimeEnumerate,
          placeholder: "请选择超时状态",
          width: "130px",
        },
        {
          label: "报警时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          width: "200px",
          format: "YYYY-MM-DD",
          valueFormat: "YYYY-MM-DD",
        },
      ];
      if (applicationCode.value === "LINE_LOSS_MANAGEMENT") {
        state.search = state.search.filter((item) => item.value !== "alarmHandlerResult");
        const keywordItem = state.search.find((s) => s.value === "keyword");
        if (keywordItem) {
          keywordItem.placeholder = "请输入事件名称、设备名称";
        }
        state.columns = createLineLossManagementColumns();
      }
      //操作是否由权限控制
      if (operateApps.includes(applicationCode.value)) {
        const permissions = await cubeDictionaryService.getDictionaryTree({ itemCode: applicationCode.value });
        operatePermissions.value = permissions.filter((x) => x.variable === "true").map((x) => x.code);
        state.api.pathParams.push({ value: "permissions", defaultValue: JSON.stringify(operatePermissions.value) });
      }
    });
    const changeData = (record) => {
      tableData.value.searchRecord();
    };
    const beforeGet = (params) => {
      return {
        applicationCode: JSON.parse(sessionStorage.getItem("GH-currentApplication")).code,
        ...params,
      };
    };
    onMounted(() => {
      // searchCacheHandle();
    });
    const searchCacheHandle = () => {
      // 获取路由参数
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let query = {};
      // debugger
      if (params.searchValue && params.searchValue !== "undefined") {
        query = JSON.parse(params.searchValue);
        tableData.value.form.alarmHandlerTimeoutStatus = query.alarmHandlerTimeoutStatus;
        tableData.value.form.alarmLevelId = query.alarmLevelId;
        tableData.value.form.alarmStatus = query.alarmStatus;
        tableData.value.form.keyword = query.keyword;
        tableData.value.form.date = query.date;
        tableData.value.form.applicationCode = query.applicationCode;
        tableData.value.form.alarmHandlerResult = query.alarmHandlerResult;
        setTimeout(() => tableData.value.getData(), 100);
      }
    };
    /* 挂起 */
    const suspend = (record) => {
      state.selectedRow = record;
      handelSuspendModal.value.visible = true;
    };
    /**处理 */
    const handle = (record) => {
      state.selectedRow = record;
      state.handleMode = "single";
      handelResultModal.value.visible = true;
    };
    const handleableAlarmStatuses = ["ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND", "ALARM_UN_CONFIRMED"];
    const canHandleRecord = (record) => handleableAlarmStatuses.includes(record.alarmStatus);
    const isBatchHandleVisible = computed(() => {
      if (applicationCode.value === "LINE_LOSS_MANAGEMENT") return false;
      return !operateApps.includes(applicationCode.value) || operatePermissions.value?.includes("HANDLE");
    });
    const canBatchHandle = computed(() => {
      const selectedRows = tableData.value?.selectedRows ?? [];
      return selectedRows.length > 0 && selectedRows.every(canHandleRecord);
    });
    const handleBatch = () => {
      const selectedRows = tableData.value?.selectedRows ?? [];
      if (!selectedRows.length) {
        proxy.$message.warning("请选择需要处理的报警记录");
        return;
      }
      if (!selectedRows.every(canHandleRecord)) {
        proxy.$message.warning("只能选择待确认、处理中或已挂起的报警记录");
        return;
      }
      state.handleMode = "batch";
      handelResultModal.value.visible = true;
    };
    /* 移交 */
    const getp = (data, pid = null, res = []) => {
      data.forEach((element) => {
        res.push(element);
        if (element.children && element.children.length !== 0) {
          getp(element.children, element.id, res);
        }
      });
      return res;
    };
    /* 移交 */
    const transfer = (record) => {
      proxy.$api.positionList().then((resData) => {
        proxy.$api.getOrganizations().then((res) => {
          const feature = window.config.feature;
          const usePersonal = feature ? Boolean(feature.usePersonal) : false;
          state.modal.search = [
            {
              label: "职位",
              value: "positionId",
              component: "g-select",
              options: resData.map((pos) => {
                return {
                  label: pos.name,
                  value: pos.id,
                };
              }),
              field: { value: "value", label: "label" },
            },
            {
              label: "部门",
              value: "organizationId",
              component: "g-select",
              options: getp(res).map((data) => {
                data.label = data.name;
                data.value = data.id;
                return data;
              }),
            },
            {
              label: "工作状态",
              value: "workStatus",
              component: "g-select",
              options: Object.keys(workStatus).map((item) => {
                return {
                  label: workStatus[item],
                  value: item,
                };
              }),
              field: { value: "value", label: "label" },
            },
            // ...usePersonalSearch(),
            {
              label: "",
              value: "keyword",
              placeholder: "请输入人员名称",
            },
          ];
          state.selectedRow = record;
          state.modal.visible = true;
        });
      });
      state.selectedRow = record;
      state.modal.visible = true;
    };
    /* 保存移交 */
    const chengUser = (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        const feature = window.config.feature;
        const usePersonal = feature ? Boolean(feature.usePersonal) : false;
        const users = selectedItems?.map((e) => {
          return {
            userId: usePersonal ? e?.userId : e?.id,
            userName: e?.name,
            departmentId: usePersonal ? e?.organizationId : e?.organizations[0]?.id,
            departmentName: usePersonal ? e?.organizationName : e?.organizations[0]?.name,
          };
        });
        proxy.$api
          .alarmHandelAssign({
            id: state.selectedRow.id,
            assignUsers: users,
          })
          .then((res) => {
            proxy.$message.success("提交成功");
            state.modal.visible = false;
            tableData.value.getData();
          });
      }
    };
    /* 保存挂起 */
    const saveSuspend = async (form) => {
      try {
        state.confirmSuspendLoading = true;
        await proxy.$api.alarmHandelSuspend({ id: state.selectedRow.id, ...form });
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
        tableData.value.getData();
      } finally {
        state.confirmSuspendLoading = false;
      }
    };
    const saveHandel = async (form) => {
      try {
        state.confirmHandleLoading = true;
        if (state.handleMode === "batch") {
          const ids = (tableData.value?.selectedRowKeys ?? []).map((id) => String(id));
          await proxy.$api.alarmBatchHandler({
            ids,
            alarmConfirmedResult: form.alarmHandlerResult,
            alarmConfirmedResultRemark: form.alarmHandlerResultRemark,
          });
          tableData.value.clearSelection();
        } else {
          await proxy.$api.alarmHandelResult({ id: state.selectedRow.id, ...form });
        }
        proxy.$message.success("提交成功");
        handelResultModal.value.cancel();
        tableData.value.getData();
      } finally {
        state.confirmHandleLoading = false;
      }
    };
    // 获取删除权限
    const isDeletePermission = computed(() => {
      return hasPermission(appFunctionCodes?.alarmRecord?.delete);
    });
    const selectRowKeys = computed(() => {
      return tableData.value?.selectedRowKeys;
    });
    const handleBatchDelete = async () => {
      const ids = tableData.value?.selectedRowKeys ?? [];
      if (!ids.length || state.batchDeleteLoading) return;
      try {
        state.batchDeleteLoading = true;
        await proxy.$api.deleteAlarmRecord(ids);
        proxy.$message.success("删除成功");
        const page = tableData.value.page;
        if (page.pageNumber > 1 && ids.length >= tableData.value.dataSource.length) {
          tableData.value.page.pageNumber = page.pageNumber - 1;
        }
        tableData.value.clearSelection();
        tableData.value.getData();
      } catch {
      } finally {
        state.batchDeleteLoading = false;
      }
    };
    return {
      saveHandel,
      ...toRefs(state),
      handelStatusColor,
      transfer,
      suspend,
      handle,
      chengUser,
      handelSuspendModal,
      handelResultModal,
      saveSuspend,
      tableData,
      beforeGet,
      changeData,
      alarmStatusList: alarmHandleEnumerate,
      operatePermissions,
      operateApps,
      applicationCode,
      selectRowKeys,
      isBatchHandleVisible,
      canBatchHandle,
      handleBatch,
      isDeletePermission,
      handleBatchDelete,
    };
  },
});
</script>

<style></style>
