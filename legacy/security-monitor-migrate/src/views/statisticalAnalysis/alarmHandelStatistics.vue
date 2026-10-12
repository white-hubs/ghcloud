<template>
  <g-table ref="statisticTable" :title="pageTitle" :api="api" :search="search" :btns="[]" :columns="columns"
    :beforeGet="beforeGet" tableCode="ALARM_HANDEL_STATISTICS">
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="exportTable">
        导出
      </a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  getCurrentInstance,
  onBeforeMount,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import statisticsTable from "./components/statisticsTable.vue";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { statisticsTable },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const applicationCode = ref(null);
    const router = useRouter();
    const statisticTable = ref(null);
    const path = window.location.pathname.split("/").reverse()[0];

    // 获取上一个月的开始时间
    const prevMonthStartDate = moment().clone().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
    const prevMonthEndDate = moment().clone().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');

    const search = ref([
      {
        component: "span",
        value: "applicationCode",
        defaultValue: "SECURITY_MONITORING",
      },
      {
        label: "所属部门",
        value: "departmentId",
        url: "deptList",
        component: "g-select",
        field: { id: "value", name: "label" },
        placeholder: "请选择所属部门",
      },
      {
        label: "报警事件",
        value: "alarmEventTypeCode",
        url: "geteventtypes",
        component: "g-select",
        field: { id: "value", name: "label" },
        placeholder: "请选择报警事件",
      },
      {
        label: "报警时间",
        value: "date",
        defaultDate: "period",
        isSpecial: true,
        date: [prevMonthStartDate, prevMonthEndDate],
        component: "a-range-picker",
      },
      {
        label: "",
        value: "keyword",
        placeholder: "请输入人员姓名",
      },
    ]);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      exportLoading: false,
      api: {
        list: "getAlarmStatisticByUser",
      },

      columns: [
        {
          dataIndex: "userName",
          title: "人员姓名",
          width: 100,
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '--'}</a-popover>);
          },
        },
        {
          dataIndex: "departmentName",
          title: "所属部门",
          width: 100,
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '--'}</a-popover>);
          },
        },
        {
          dataIndex: "departmentTotalNum",
          title: "部门报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('departmentTotalNum', record) }}>{record.departmentTotalNum}</a-button>;
          }
        },
        {
          dataIndex: "totalNum",
          title: "个人报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('totalNum', record) }}>{record.totalNum}</a-button>;
          }
        },
        {
          dataIndex: "unconfirmedNum",
          title: "未响应报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('unconfirmedNum', record) }}>{record.unconfirmedNum}</a-button>;
          }
        },
        {
          dataIndex: "progressConfirmedNum",
          title: "处理中报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('progressConfirmedNum', record) }}>{record.progressConfirmedNum}</a-button>;
          }
        },
        {
          dataIndex: "handlerNum",
          title: "已处理报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('handlerNum', record) }}>{record.handlerNum}</a-button>;
          }
        },
        {
          dataIndex: "suspendNum",
          title: "已挂起报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('suspendNum', record) }}>{record.suspendNum}</a-button>;
          }
        },
        {
          dataIndex: "timeoutNum",
          title: "超时报警数",
          width: 100,
          customRender: ({ record }) => {
            return <a-button type="link" onClick={() => { clickSlot('timeoutNum', record) }}>{record.timeoutNum}</a-button>;
          }
        },
        {
          dataIndex: "ratio",
          title: "报警占比",
          width: 100,
          slots: {
            customRender: "ratio",
          },
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '0%'}</a-popover>);
          },
        },
        {
          dataIndex: "handlerRate",
          title: "报警处理率",
          width: 100,
          slots: {
            customRender: "handlerRate",
          },
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '0%'}</a-popover>);
          },
        },
        {
          dataIndex: "confirmedRate",
          title: "报警响应率",
          width: 100,
          slots: {
            customRender: "confirmedRate",
          },
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '0%'}</a-popover>);
          },
        },
        {
          dataIndex: "timeoutRate",
          title: "报警超时率",
          width: 100,
          slots: {
            customRender: "timeoutRate",
          },
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
        {
          dataIndex: "averageProcessing",
          title: "处理平均耗时",
          width: 120,
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
      ],
    });
    onMounted(() => { });
    const getQuery = (data) => {
      let query = "";
      for (const key in data) {
        query += `${key}=${data[key]}&`;
      }
      return query;
    };
    const clickSlot = (slot, record) => {
      let period = statisticTable.value.form.period;
      let alarmEventTypeId = statisticTable.value.form.alarmEventTypeCode;
      switch (slot) {
        case "totalNum":
          const info = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period == null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId,
            alarmEvent: "",
            alarmStatus: "",
            userResponsible: false,
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(info)}`
          );

          break;
        case "progressConfirmedNum":
          const query = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId === null ? "" : record.userId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "ALARM_PROGRESS_CONFIRMED",
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };

          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(query)}`
          );
          break;
        case "handlerNum":
          const handlerNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId === null ? "" : record.userId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "ALARM_HANDLER",
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(handlerNum)}`
          );

          break;
        case "suspendNum":
          const suspendNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId === null ? "" : record.userId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "ALARM_SUSPEND",
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(suspendNum)}`
          );
          break;

        case "timeoutNum":
          const timeoutNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId === null ? "" : record.userId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "",
            alarmHandlerTimeoutStatus: "TIMED_OUT",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(timeoutNum)}`
          );
          break;
        case "departmentTotalNum":
          const department = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: "",
            departmentId: record.departmentId === null ? "" : record.departmentId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "",
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },
            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(department)}`
          );
          break;
        case "unconfirmedNum":
          const unconfirmed = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
            alarmEventTypeId: alarmEventTypeId == null ? "" : alarmEventTypeId,
            userId: record.userId === null ? "" : record.userId,
            alarmEvent: "",
            userResponsible: false,
            alarmStatus: "ALARM_UN_CONFIRMED",
            alarmHandlerTimeoutStatus: "",
            applicationCode: "SECURITY_MONITORING",
          };
          history.pushState(
            { current: location.pathname + location.search },
            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(unconfirmed)}`
          );
          break;
      }
    };
    const exportTable = () => {
      state.exportLoading = true;
      let period = statisticTable.value.form.period;
      let departmentId = statisticTable.value.form.departmentId;
      let keyword = statisticTable.value.form.keyword;
      proxy.$api
        .alarmHandelStatisticExport({
          period: period,
          departmentId: departmentId,
          keyword: keyword,
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
          link.setAttribute("download", "报警处理统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          state.exportLoading = false;
        });
    };
    const beforeGet = (params) => {
      params.applicationCode = "SECURITY_MONITORING";
      return params;
    };
    return {
      ...toRefs(state),
      beforeGet,
      clickSlot,
      exportTable,
      getQuery,
      search,
      statisticTable,
    };
  },
});
</script>

<style></style>
