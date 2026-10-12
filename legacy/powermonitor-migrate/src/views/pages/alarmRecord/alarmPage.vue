<template>
  <g-table
    ref="tableData"
    :title="pageTitle"
    :search="search"
    :api="api"
    :btns="btns"
    :columns="columns"
    editMode="page"
    :beforeGet="beforeGet"
  >
    <template #pre-item="{ record }">
      <a-radio-group
        v-model:value="btnStatus"
        button-style="solid"
        @change="changeData(record)"
        style="marginright: 16px"
      >
        <a-radio-button
          v-for="item in alarmStatusList"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </a-radio-button>
      </a-radio-group>
    </template>
    <template #btn="{ record }">
      <a-button
        type="link"
        @click="transfer(record)"
        v-if="
          record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
          record.alarmStatus === 'ALARM_SUSPEND'
        "
      >
        移交
      </a-button>
      <a-button
        type="link"
        @click="suspend(record)"
        v-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
      >
        挂起
      </a-button>
    </template>
  </g-table>
  <modal-table
    title="选择人员"
    v-model:value="modal.visible"
    url="tenantUsers"
    :columns="modal.columns"
    :search="modal.search"
    :searchLength="3"
    :width="1060"
    @modal-save="chengUser"
  ></modal-table>
  <handel-suspend
    ref="handelSuspendModal"
    :width="560"
    @modal-save="saveSuspend"
  ></handel-suspend>
</template>
<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  reactive,
  ref,
  toRefs,
} from "vue";
import {
  alarmOvertimeEnumerate,
  alarmHandleEnumerate,
} from "@/utils/enumerate";
import handelSuspend from "./components/handelSuspend.vue";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { handelSuspend },
  setup() {
    const { proxy } = getCurrentInstance();
    const handelSuspendModal = ref(null);
    const tableData = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      btnStatus: "",
      api: {
        list: "getAlarmRecords",
        path: "/alarmDetail",
        pathParams: [{ value: "businessKey" }],
      },
      search: [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: "ELECTRICAL",
        },
        {
          label: "报警级别",
          value: "alarmLevelId",
          component: "g-select",
          url: "getAlarmLevels",
          field: { name: "label", id: "value" },
          placeholder: "请选择报警级别",
        },
        {
          label: "超时状态",
          value: "alarmHandlerTimeoutStatus",
          component: "g-select",
          options: alarmOvertimeEnumerate,
          placeholder: "请选择超时状态",
        },
        {
          label: "报警时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称/报警规则",
        },
      ],
      btns: ["detail"],
      columns: [
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          slots: {
            customRender: "alarmTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm") : "--";
          },
        },
        {
          dataIndex: "alarmTargetName",
          title: "报警设备",
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
        },
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
        },
        {
          dataIndex: "areaName",
          title: "报警区域",
        },
        {
          dataIndex: "timeoutProcessTimesName",
          title: "处理时限",
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
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          slots: {
            customRender: "alarmStatusName",
          },
          customRender: ({ text, record }) => {
            return (
              <div>
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          dataIndex: "estimateHandlerTime",
          title: "预计处理时间",
          slots: {
            customrender: "estimateHandlerTime",
          },
          customRender: ({ text }) => {
            return (
              <a-popover
                content={
                  text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--"
                }
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
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
                MALE: '男',
                FEMALE: '女',
                NONE: '保密'
              }
              return text ? genderValues[text] : '--';
            },
          },
          {
            title: "状态",
            dataIndex: "enabled",
            key: "enabled",
            customRender: ({ text }) => {
              return text ? "启用" : "禁用";
            },
          },
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
    });
    const handelStatusColor = computed(() => key => {
      let obj = alarmHandleEnumerate.find(item => item.value === key);
      if (obj) {
        return obj.color;
      } else {
        return "";
      }
    });
    const changeData = record => {
      tableData.value.searchRecord();
    };
    const beforeGet = params => {
      return {
        ...params,
        alarmStatus: state.btnStatus,
      };
    };
    /* 挂起 */
    const suspend = record => {
      state.selectedRow = record;
      handelSuspendModal.value.visible = true;
    };
    /* 移交 */
    const transfer = record => {
      state.selectedRow = record;
      state.modal.visible = true;
    };
    /* 保存移交 */
    const chengUser = (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        let params = {
          id: state.selectedRow.id,
          userId: selectedItems[0].id,
          userName: selectedItems[0].name,
          departmentId: selectedItems[0].organizations.length
            ? selectedItems[0].organizations[0].id
            : null,
          departmentName: selectedItems[0].organizations.length
            ? selectedItems[0].organizations[0].name
            : null,
        };
        proxy.$api.alarmHandelTransfer(params).then(res => {
          proxy.$message.success("提交成功");
          state.modal.visible = false;
          tableData.value.getData();
        });
      }
    };
    /* 保存挂起 */
    const saveSuspend = form => {
      proxy.$api
        .alarmHandelSuspend({ id: state.selectedRow.id, ...form })
        .then(res => {
          proxy.$message.success("提交成功");
          handelSuspendModal.value.cancel();
          tableData.value.getData();
        });
    };
    return {
      ...toRefs(state),
      handelStatusColor,
      transfer,
      suspend,
      chengUser,
      handelSuspendModal,
      saveSuspend,
      tableData,
      beforeGet,
      changeData,
      alarmStatusList: alarmHandleEnumerate,
    };
  },
});
</script>

<style></style>
