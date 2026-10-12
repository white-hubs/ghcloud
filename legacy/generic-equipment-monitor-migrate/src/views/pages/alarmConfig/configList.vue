<template>
  <g-table :title="pageTitle" :columns="columns" :api="api" :btns="btns" :search="search"
    ref="tableData" editMode="page" :beforeGet="beforeGet" :scrollX="0" :applicationCode="applicationCode" tableCode="alarm-config-list">
    <template #header-btns>
      <a-button type="primary" @click="operationRecord()"> 新增 </a-button>
    </template>
    <template #beforeBtn="{ record }">
      <a-button type="link" @click="more(record)"> 详情 </a-button>
      <a-button type="link" @click="edit(record)"> 编辑 </a-button>
      <a-button type="link" @click="copy(record)" v-if="applicationCode !== 'LINE_LOSS_MANAGEMENT'"> 复制 </a-button>
      <a-button type="link" @click="changeHandle(record)" v-if="record.enabled"> 禁用规则 </a-button>
      <a-button type="link" @click="changeHandle(record)" v-else> 启用规则 </a-button>
    </template>
  </g-table>
  <DisEnableModal ref="disenableModalRef" @ok="refreshTable"></DisEnableModal>
</template>

<script lang="jsx">
import { timeUnit } from "@/utils/enumerate";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useStore } from "vuex";
import DisEnableModal from "./components/disenableModal.vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { DisEnableModal },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const applicationCode = ref(null);
    const currentApplication = sessionStorage.getItem("GH-currentApplication");
     applicationCode.value = JSON.parse(currentApplication)?.code;

    const tableData = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: applicationCode.value==='LINE_LOSS_MANAGEMENT'?'planRulesLineList':"planRulesList",
        deleteSingle:applicationCode.value==='LINE_LOSS_MANAGEMENT'? "deletePlanLineRules": "deletePlanRules",
        path: applicationCode.value==='LINE_LOSS_MANAGEMENT'? "alarmConfigDetail":"/alarmConfigDetail",
      },
      btns: ["deleteSingle"],
      search: [],
      columns: [
        {
          dataIndex: "name",
          title: "预警规则名称",
          width: 80,
          fixed: 'left',
          ellipsis: true,
          customRender: ({ text, record, index }) => {
            return (<a-popover content={text || '--'}>{text || '--'}</a-popover>);
          }
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          align: "center",
          width: 50,
        },
        {
          dataIndex: "repeatTime",
          title: "去重周期",
          width: 80,
          align: "center",
          slots: {
            customRender: "repeatTime",
          },
          customRender: ({ text, record, index }) => {
            let params = timeUnit.find((item) => item.value === record.repeatTimeUnit);
            return record.repeatTime + params?.label;
          },
        },
        {
          dataIndex: "estimatedHandlerTime",
          title: "处理时限",
          width: 80,
          slots: {
            customRender: "estimatedHandlerTime",
          },
          customRender: ({ text, record, index }) => {
            let params = timeUnit.find(
              (item) => item.value === record.estimatedHandlerUnit
            );
            return record.estimatedHandlerTime == null ? 0 : record.estimatedHandlerTime.toString() + (params?.label??'');
          },
        },
        {
          dataIndex: "enabled",
          title: "状态",
          width: 80,
          customRender: ({ text, record, index }) => {
            return  record.enabled ? <a-tag color="green">启用</a-tag> : <a-tag color="default">禁用</a-tag>;
          }
        },
        {
          dataIndex: "disableDuration",
          title: "禁用时长",
          width: 80,
          customRender: ({ text, record, index }) => {
            const textVal = record.disableDuration ? `${record.disableDuration} 小时` : '';
            return (<a-popover content={textVal || '--'}>{textVal || '--'}</a-popover>);
          }
        },
        {
          dataIndex: "remark",
          title: "说明",
          width: 80,
          ellipsis: true,
          customRender: ({ text, record, index }) => {
            return (<a-popover content={record.remark}>{record.remark || '--'}</a-popover>);
          }
        },
        {
          dataIndex: "action",
          title: "操作",
          width:180,
          slots: {
            customRender: "action",
          },
        },
      ]
    });
    const beforeGet = (params) => {
      try {
        const currentApplication = sessionStorage.getItem("GH-currentApplication");
        if (!currentApplication) {
          return params;
        }
        const app = JSON.parse(currentApplication);
        return {
          ...params,
          applicationCode: app?.code,
        };
      } catch (error) {
        return params;
      }
    };
    onBeforeMount(() => {
      try {
        const currentApplication = sessionStorage.getItem("GH-currentApplication");
        if (!currentApplication) {
          return;
        }
        const application = JSON.parse(currentApplication);
        if (application?.code) {
          applicationCode.value = application.code;
          if (application.code === "LINE_LOSS_MANAGEMENT") {
            state.columns = state.columns.filter(
              (col) => col.dataIndex !== "repeatTime" && col.dataIndex !== "disableDuration"
            );
          }
        } else {
          return;
        }
        state.search = [
          {
            label: "",
            component: "span",
            value: "applicationCode",
            defaultValue: applicationCode.value,
          },
          {
            label: "",
            value: "keyword",
            placeholder: "请输入规则名称",
          },
          {
            label: "报警级别",
            value: "alarmLevelId",
            component: "gSelect",
            url: "getAlarmLevels",
            field: { name: "label", id: "value" },
            placeholder: "请选择报警级别",
          },
        ];
      } catch (error) {
      }
    });
    const operationRecord = () => {
      const target = `/portal/iot-center/alarm?type=add`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const more = (record) => {
      const target = `/portal/iot-center/alarm?type=detail&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const copy = (record) => {
      const target = `/portal/iot-center/alarm?type=edit&id=${record.id}&copy=1`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    }
    const edit = (record) => {
      const target = `/portal/iot-center/alarm?type=edit&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const disenableModalRef = ref(null);
    const changeHandle = (record) => {
      if (record?.enabled) {
        const application = JSON.parse(currentApplication || "{}");
        if (application.code === "LINE_LOSS_MANAGEMENT") {
          disableLineLossRule(record);
        } else {
          disenableModalRef.value.openModal(record);
        }
      } else {
        enabledHandle(record);
      }
    };

    /** 线损规则禁用：不调通用禁用弹窗，直接调用线损启用接口并传 enabled: false */
    const disableLineLossRule = async (record) => {
      try {
        await proxy.$api.enabledPlanLineRules({
          id: record.id,
          enabled: false,
        });
        tableData.value.getData();
        proxy.$message.success("操作成功！");
      } catch (error) {
        proxy.$message.error("操作失败");
      }
    };

    const enabledHandle = async (record) => {
        const application = JSON.parse(currentApplication);
        if(application.code === "LINE_LOSS_MANAGEMENT"){
      await proxy.$api.enabledPlanLineRules({
        id: record.id,
        enabled: true,
      });
      tableData.value.getData();
      proxy.$message.success("操作成功！");
        }else{
          await proxy.$api.enabledPlanRules({
        id: record.id,
        enabled: true,
      });
      tableData.value.getData();
      proxy.$message.success("操作成功！");
        }
     
    };
    const refreshTable = async () => {
      tableData.value.getData();
    };
    return {
      ...toRefs(state),
      applicationCode,
      enabledHandle,
      tableData,
      operationRecord,
      more,
      edit,
      beforeGet,
      copy,
      changeHandle,
      refreshTable,
      disenableModalRef
    };
  },
});
</script>

<style></style>
