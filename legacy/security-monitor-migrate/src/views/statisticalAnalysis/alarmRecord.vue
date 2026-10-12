<template>
  <g-table 
    ref="tableData" 
    title="报警记录" 
    :api="api"
    :btns="[]"
    :columns="columns"
    :beforeGet="beforeGet"
    tableCode="ALARM_RECORD_BY_EVENT"
  >
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="exportTable">
        导出
      </a-button>
    </template>
    <template #batch>
      <a-button @click="goBack">
        返回
      </a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import { defineComponent, getCurrentInstance, reactive, toRefs, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const {
      alarmStatus,
      alarmHandlerTimeoutStatus,
      period,
      userId,
      alarmEvent,
      alarmEventName,
      userResponsible,
      path,
      departmentId,
      alarmEventTypeId
    } = route.query;
    const state = reactive({
      exportLoading: false,
      columns: [
        {
          dataIndex: "alarmTime",
          title: "报警时间",
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
          width:180
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          width:80
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
          width:80,
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
          width:80
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          width:80,
          slots: {
            customRender: "alarmStatusName",
          },
          customRender: ({ text, record }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "estimateHandlerTime",
          title: "预计处理时间",
          slots: {
            customrender: "estimateHandlerTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
          width:100,
          slots: {
            customRender: "alarmHandlerName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
      ],
      api: {
        list: "getAlarmCommonRecords",
      },
    });
    const goBack = () => {
      history.back();
    };
    const tableData = ref(null);
    const exportTable = () => {
      state.exportLoading = true;

      proxy.$api
        .alarmRecordExport({
          alarmStatus: alarmStatus==''?undefined:alarmStatus,
          alarmHandlerTimeoutStatus: alarmHandlerTimeoutStatus==''?undefined:alarmHandlerTimeoutStatus,
          period: period,
          userResponsible,
          userId: userId==''?undefined:userId,
          departmentId: departmentId==''?undefined:departmentId,
          alarmEventTypeId: alarmEventTypeId==''?undefined:alarmEventTypeId,
          alarmEvent: alarmEvent==''?undefined:alarmEvent,
          alarmEventName: alarmEventName==''?undefined:alarmEventName,
          applicationCode: "SECURITY_MONITORING",
        })
        .then((res) => {
          state.exportLoading = false;
          const link = document.createElement("a");
          let blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "报警记录统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          state.exportLoading = false;
        });
    };
    return {
      ...toRefs(state),
      goBack,
      tableData,
      exportTable,
      beforeGet:(params)=>{
        return {
          ...params,
          applicationCode: "SECURITY_MONITORING",
          alarmEvent,
          alarmEventName,
          alarmStatus,
          alarmHandlerTimeoutStatus:alarmHandlerTimeoutStatus??undefined,
          period:period??undefined,
          userId:userId??undefined
        };
      }
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.content-search) {
  padding-top: 0 !important;
}
</style>