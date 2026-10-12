<template>
  <g-table 
    ref="statisticTable" 
    :title="pageTitle" 
    :api="api" 
    :search="search" 
    :btns="[]" 
    :columns="columns"
    @slot="clickSlot"
    tableCode="ALARM_STATISTICS"
    :beforeGet="beforeGet"
  >
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="exportTable">
        导出
      </a-button>
    </template>
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, reactive, toRefs, ref, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import statisticsTable from "./components/statisticsTable.vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { statisticsTable },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const statisticTable = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      exportLoading: false,
      api: {
        list: "getAlarmStatisticByEvent",
      },
      search: [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: "SECURITY_MONITORING",
        },
        {
          label: "报警时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
      ],
      columns: [
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
          customRender: ({ text, record, index }) => {
            return text||'--';
          },
        },
        {
          dataIndex: "totalNum",
          title: "报警总数",
        },
        {
          dataIndex: "unConfirmedNum",
          title: "待接收报警数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('unConfirmedNum',record)}>{text}</a-button>;
          },
        },
        {
          dataIndex: "progressConfirmedNum",
          title: "处理中报警数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('progressConfirmedNum',record)}>{text}</a-button>;
          },
        },
        {
          dataIndex: "handlerNum",
          title: "已处理报警数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('handlerNum',record)}>{text}</a-button>;
          },
        },
        {
          dataIndex: "suspendNum",
          title: "已挂起报警数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('suspendNum',record)}>{text}</a-button>;
          },
        },
        {
          dataIndex: "timeoutNum",
          title: "超时报警数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('timeoutNum',record)}>{text}</a-button>;
          },
        },
      ]
    });
    const getQuery = (data) => {
      let query = "";
      for (const key in data) {
        query += `${key}=${data[key]}&`;
      }
      return query;
    };
    const clickSlot = (slot, record) => {
      let period = statisticTable.value.form.period;
      switch (slot) {
        case "unConfirmedNum":
          const unConfirmedNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period == null ? "" : period,
            alarmEvent: record.alarmEvent,
            alarmEventName: record.alarmEventName,
            userId: "",
            alarmStatus: "ALARM_UN_CONFIRMED",
            alarmHandlerTimeoutStatus: "",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(unConfirmedNum)}`
          );

          break;
        case "progressConfirmedNum":
          const progressConfirmedNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period == null ? "" : period,
            alarmEvent: record.alarmEvent,
            alarmEventName: record.alarmEventName,
            userId: "",
            alarmStatus: "ALARM_PROGRESS_CONFIRMED",
            alarmHandlerTimeoutStatus: "",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(progressConfirmedNum)}`
          );
          break;
        case "handlerNum":
          const handlerNum = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period == null ? "" : period,
            alarmEvent: record.alarmEvent,
            alarmEventName: record.alarmEventName,
            userId: "",
            alarmStatus: "ALARM_HANDLER",
            alarmHandlerTimeoutStatus: "",
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
            period: period == null ? "" : period,
            alarmEvent: record.alarmEvent,
            alarmEventName: record.alarmEventName,
            userId: "",
            alarmStatus: "ALARM_SUSPEND",
            alarmHandlerTimeoutStatus: "",
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
            period: period == null ? "" : period,
            alarmEvent: record.alarmEvent,
            alarmEventName: record.alarmEventName,
            userId: "",
            alarmStatus: "",
            alarmHandlerTimeoutStatus: "TIMED_OUT",
          };
          history.pushState(
            { current: location.pathname + location.search },

            "",
            `/portal/securityMonitoring/alarm/record?${getQuery(timeoutNum)}`
          );

          break;
      }
    };
    const exportTable = () => {
      state.exportLoading = true;
      let period = statisticTable.value.form.period;
      let keyword = statisticTable.value.form.keyword;
      proxy.$api
        .alarmStatisticExport({
          period: period,
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
          link.setAttribute("download", "报警统计.xlsx");
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
      clickSlot,
      statisticTable,
      exportTable,
      beforeGet:(params)=>{
        return {
          ...params,
          applicationCode: "SECURITY_MONITORING",
        }
      }
    };
  },
});
</script>

<style></style>
