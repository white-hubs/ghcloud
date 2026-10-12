<template>
  <g-layout title="报警记录">
    <template #header-btn>
      <a-button type="primary" :loading="exportLoading" @click="exportTable"
        >导出</a-button
      >
    </template>
    <template #content-table>
      <a-table ref="tableData" :api="api" :btns="[]" :search="search" :columns="columns">
      </a-table>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-layout>
</template>
<script lang="jsx">
import moment from "moment";
import aTable from "./components/aTable.vue";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  components: { aTable },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const applicationCode = ref(null);
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
            return text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--";
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
            return text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--";
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
      ],
      search: [],
      api: {
        list: "getAlarmRecordsCommonPage",
      },
    });
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
      state.search = [
        {
          components: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },
        {
          label: "",
          components: "span",
          value: "userId",
          defaultValue: userId,
        },
        {
          label: "",
          components: "span",
          value: "departmentId",
          defaultValue: departmentId,
        },
        {
          label: "",
          components: "span",
          value: "alarmEventTypeId",
          defaultValue: alarmEventTypeId,
        },
        {
          label: "",
          components: "span",
          value: "userResponsible",
          defaultValue: userResponsible,
        },
        {
          label: "",
          components: "span",
          value: "alarmEvent",
          defaultValue: alarmEvent,
        },
        {
          label: "",
          components: "span",
          value: "alarmEventName",
          defaultValue: alarmEventName,
        },
        {
          label: "",
          components: "span",
          value: "alarmStatus",
          defaultValue: alarmStatus,
        },
        {
          label: "",
          components: "span",
          value: "alarmHandlerTimeoutStatus",
          defaultValue: alarmHandlerTimeoutStatus,
        },
        {
          label: "",
          components: "span",
          value: "period",
          defaultValue: period,
        },
      ];
    });
    const goBack = () => {
      history.back();
      // router.push(`/${path}`)
    };
    const exportTable = () => {
      state.exportLoading = true;
      proxy.$api
        .alarmRecordExport({
          userResponsible,
          applicationCode: applicationCode.value,
          alarmStatus: alarmStatus==''?undefined:alarmStatus,
          alarmHandlerTimeoutStatus: alarmHandlerTimeoutStatus==''?undefined:alarmHandlerTimeoutStatus,
          period: period==''?undefined:period,
          userId: userId==''?undefined:userId,
          departmentId: departmentId==''?undefined:departmentId,
          alarmEventTypeId: alarmEventTypeId==''?undefined:alarmEventTypeId,
          alarmEvent: alarmEvent==''?undefined:alarmEvent,
          alarmEventName: alarmEventName==''?undefined:alarmEventName,
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
      exportTable,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.content-search) {
  padding-top: 0 !important;
}
</style>
