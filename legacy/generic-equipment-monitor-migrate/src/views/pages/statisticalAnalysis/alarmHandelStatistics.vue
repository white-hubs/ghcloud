<template>
  <g-table ref="statisticTable" :title="pageTitle" :api="api" :search="search" :btns="[]" :columns="columns"
    :applicationCode="applicationCode" tableCode="alarm-handel-statistics-list" :beforeGet="beforeGet">
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="expordTable">
        导出
      </a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const store = useStore();
    const applicationCode = ref(null);
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const statisticTable = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      exportLoading: false,
      api: {
        list: "getAlarmStatisticByUser",
      },
      search: [],
      columns: [
        {
          dataIndex: "userName",
          title: "人员姓名",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '--'}</a-popover>);
          },
        },
        {
          dataIndex: "departmentName",
          title: "所属部门",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || '--'}</a-popover>);
          },
        },
        {
          dataIndex: "departmentTotalNum",
          title: "部门报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('departmentTotalNum', record) }}>{text || 0}</a-button>;
          },
        },
        {
          dataIndex: "totalNum",
          title: "个人报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('totalNum', record) }}>{text || 0}</a-button>;
          },
        },
        {
          dataIndex: "unconfirmedNum",
          title: "未响应报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('unconfirmedNum', record) }}>{text || 0}</a-button>;
          }
        },
        {
          dataIndex: "progressConfirmedNum",
          title: "处理中报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('progressConfirmedNum', record) }}>{text || 0}</a-button>;
          }
        },
        {
          dataIndex: "handlerNum",
          title: "已处理报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('handlerNum', record) }}>{text || 0}</a-button>;
          }
        },
        {
          dataIndex: "suspendNum",
          title: "已挂起报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('suspendNum', record) }}>{text || 0}</a-button>;
          }
        },
        {
          dataIndex: "timeoutNum",
          title: "超时报警数",
          align: "center",
          customRender: ({ text, record }) => {
            return <a-button type="link" onClick={() => { clickSlot('timeoutNum', record) }}>{text || 0}</a-button>;
          }
        },
        {
          dataIndex: "ratio",
          align: "center",
          title: "报警占比",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
        {
          dataIndex: "handlerRate",
          title: "报警处理率",
          align: "center",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
        {
          dataIndex: "confirmedRate",
          title: "报警响应率",
          align: "center",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
        {
          dataIndex: "timeoutRate",
          align: "center",
          title: "报警超时率",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
        {
          dataIndex: "averageProcessing",
          title: "处理平均耗时",
          align: "center",
          customRender: ({ text }) => {
            return (<a-popover content={text}>{text || 0}</a-popover>);
          },
        },
      ],
      slots: [
        {
          slot: "departmentTotalNum",
        },
        {
          slot: "totalNum",
        },
        {
          slot: "unconfirmedNum",
        },
        {
          slot: "progressConfirmedNum",
        },
        {
          slot: "handlerNum",
        },
        {
          slot: "suspendNum",
        },
        {
          slot: "timeoutNum",
        },
      ],
    });
    const getQuery = (data) => {
      let query = "";
      for (const key in data) {
        query += `${key}=${data[key]}&`;
      }
      return query;
    };
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;

      // 获取上一个月的开始时间
      const prevMonthStartDate = moment().clone().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      const prevMonthEndDate = moment().clone().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
      state.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
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
      ];
    });
    const clickSlot = (slot, record) => {
      let period = statisticTable.value.form.period;
      let alarmEventTypeId = statisticTable.value.form.alarmEventTypeCode;
      switch (slot) {
        case "totalNum":
          const info = {
            path: window.location.pathname.split("/").reverse()[0],
            period: period === null ? "" : period,
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
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(info)}`
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
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(query)}`
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
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(handlerNum)}`
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
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(suspendNum)}`
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
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(timeoutNum)}`
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
          };
          history.pushState(
            { current: location.pathname + location.search },
            "",
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(department)}`
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
          };
          history.pushState(
            { current: location.pathname + location.search },
            "",
            `/portal/genericEquipmentMonitor/alarm/record?${getQuery(unconfirmed)}`
          );
          break;
      }
    };
    const expordTable = () => {
      state.exportLoading = true;
      let period = statisticTable.value.form.period;
      let departmentId = statisticTable.value.form.departmentId;
      let keyword = statisticTable.value.form.keyword;
      proxy.$api
        .alarmHandelStatisticExport({
          period: period,
          departmentId: departmentId,
          keyword: keyword,
          applicationCode: applicationCode.value,
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
    return {
      ...toRefs(state),
      expordTable,
      statisticTable,
      getQuery,
      beforeGet: (params) => {
        params.applicationCode = applicationCode.value
        return params
      }
    };
  },
});
</script>

<style></style>
