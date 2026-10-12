<template>
  <g-table 
    :title="pageTitle"
    :columns="columns" 
    :api="api" 
    :btns="btns" 
    :search="search"
    ref="tableData" 
    editMode="page" 
    :beforeGet="beforeGet"
    tableCode="ALARM_CONFIG_LIST"
  >
    <template #header-btns>
      <a-button type="primary" @click="operationRecord()"> 新增 </a-button>
    </template>
    <template #beforeBtn="{ record }">
      <a-button type="link" @click="more(record)"> 详情 </a-button>
      <a-button type="link" @click="edit(record)"> 编辑 </a-button>
      <a-button type="link" @click="copy(record)"> 复制 </a-button>
      <a-button type="link" @click="changeHandle(record)" v-if="record.enabled" danger> 禁用规则 </a-button>
      <a-button type="link" @click="changeHandle(record)" v-else> 启用规则 </a-button>
    </template>
  </g-table>
  <DisEnableModal ref="disenableModalRef" @ok="refreshTable"></DisEnableModal>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
import { timeUnit } from "@/utils/enumerate";
import DisEnableModal from "./components/disenableModal.vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { DisEnableModal },
  setup() {
    const { proxy } = getCurrentInstance();
    const tableData = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "planRulesList",
        deleteSingle: "deletePlanRules",
        path: "/alarmRulesConfig",
      },
      btns: ["deleteSingle"],
      search: [
        {
          label: "",
          component: "span",
          value: "applicationCode",
          defaultValue: "SECURITY_MONITORING",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入规则名称",
        },
      ],
      columns: [
        {
          dataIndex: "name",
          title: "预警规则名称",
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
        },
        {
          dataIndex: "repeatTime",
          title: "去重周期",
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
          align: "center",
          slots: {
            customRender: "estimatedHandlerTime",
          },
          customRender: ({ text, record, index }) => {
            let params = timeUnit.find(
              (item) => item.value === record.estimatedHandlerUnit
            );
            return record.estimatedHandlerTime == null ? 0 : record.estimatedHandlerTime + params?.label;
          },
        },
        {
          dataIndex: "enabled",
          title: "状态",
          align: "center",
          customRender: ({ text, record, index }) => {
            return  record.enabled ? <a-tag color="green">启用</a-tag> : <a-tag color="default">禁用</a-tag>;
          }
        },
        {
          dataIndex: "disableDuration",
          title: "禁用时长",
          align: "center",
          customRender: ({ text, record, index }) => {
            const textVal = record.disableDuration ? `${disableDuration} 小时` : '';
            return (<a-popover content={textVal || '--'}>{textVal || '--'}</a-popover>);
          }
        },
        {
          dataIndex: "remark",
          title: "说明",
          ellipsis: true,
          customRender: ({ text, record, index }) => {
            return (<a-popover content={record.remark}>{record.remark || '--'}</a-popover>);
          }
        },
        {
          dataIndex: "action",
          title: "操作",
          width:250,
          slots: {
            customRender: "action",
          },
        },
      ]
    });
    const beforeGet = (params) => {
      return {
        ...params,
        applicationCode: "SECURITY_MONITORING",
      };
    };
    const operationRecord = () => {
      const target = `/portal/iot-center/alarm?type=add`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const more = (record) => {
      const target = `/portal/iot-center/alarm?type=detail&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const edit = (record) => {
      const target = `/portal/iot-center/alarm?type=edit&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const disenableModalRef = ref(null);
    const changeHandle = (record) => {
      if(record?.enabled){
        disenableModalRef.value.openModal(record)
      } else {
        enabledHandle(record)
      }
    };
    const refreshTable = async () => {
      tableData.value.getData();
    };
    const copy = (record) => {
      const target = `/portal/iot-center/alarm?type=edit&id=${record.id}&copy=1`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    }
    const enabledHandle = async (record) => {
      try {
        await proxy.$api.enabledPlanRules({
          id: record.id,
          enabled: true,
        });
        proxy.$message.success("操作成功！");
      } catch (error) {
      } finally { 
        tableData.value.getData();
      }
    };
    return {
      ...toRefs(state),
      enabledHandle,
      tableData,
      operationRecord,
      more,
      edit,
      copy,
      changeHandle,
      refreshTable,
      disenableModalRef,
      beforeGet
    };
  },
});
</script>

<style></style>
