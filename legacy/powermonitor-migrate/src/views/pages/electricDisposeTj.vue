<template>
  <statistics-table
    ref="statisticTable"
    :title="pageTitle"
    :api="api"
    :search="search"
    :btns="[]"
    :columns="columns"
    :slots="slots"
    @slot="clickSlot"
  >
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="expordTable">
        导出
      </a-button>
    </template>
  </statistics-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
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
        list: "getAlarmStatisticByUser",
      },
      search: [
        {
          label: "部门",
          value: "departmentId",
          url: "deptList",
          component: "g-select",
          field: { id: "value", name: "label" },
          placeholder: "请选择部门",
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
          placeholder: "请输入事件名称",
        },
      ],
      columns: [
        {
          dataIndex: "userName",
          title: "姓名",
        },
        {
          dataIndex: "departmentName",
          title: "部门",
        },
        {
          dataIndex: "totalNum",
          title: "负责的报警数",
          slots: {
            customRender: "totalNum",
          },
        },
        {
          dataIndex: "progressConfirmedNum",
          title: "处理中报警数",
          slots: {
            customRender: "progressConfirmedNum",
          },
        },
        {
          dataIndex: "handlerNum",
          title: "已处理报警数",
          slots: {
            customRender: "handlerNum",
          },
        },
        {
          dataIndex: "suspendNum",
          title: "已挂起报警数",
          slots: {
            customRender: "suspendNum",
          },
        },
        {
          dataIndex: "timeoutNum",
          title: "超时报警数",
          slots: {
            customRender: "timeoutNum",
          },
        },
        {
          dataIndex: "averageProcessing",
          title: "处理平均耗时",
        },
        {
          dataIndex: "handlerRate",
          title: "处理完成率",
        },
      ],
      slots: [
        {
          slot: "totalNum",
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
    const clickSlot = (slot, record) => {
      let period = statisticTable.value.form.period;
      switch (slot) {
        case "totalNum":
          router.push({
            path: "/alarm/record",
            query: {
              period: period,
              userResponsible:true,
              userId: record.userId,
              alarmEvent: null,
              alarmStatus: null,
              alarmHandlerTimeoutStatus: null,
            },
          });
          break;
        case "progressConfirmedNum":
          router.push({
            path: "/alarm/record",
            query: {
              period: period,
              userId: record.userId,
              userResponsible:true,
              alarmEvent: null,
              alarmStatus: "ALARM_PROGRESS_CONFIRMED",
              alarmHandlerTimeoutStatus: null,
            },
          });
          break;
        case "handlerNum":
          router.push({
            path: "/alarm/record",
            query: {
              period: period,
              userId: record.userId,
              alarmEvent: null,
              alarmStatus: "ALARM_HANDLER",
              alarmHandlerTimeoutStatus: null,
            },
          });
          break;
        case "suspendNum":
          router.push({
            path: "/alarm/record",
            query: {
              period: period,
              userId: record.userId,
              alarmEvent: null,
              userResponsible:true,
              alarmStatus: "ALARM_SUSPEND",
              alarmHandlerTimeoutStatus: null,
            },
          });
          break;
        case "timeoutNum":
          router.push({
            path: "/alarm/record",
            query: {
              period: period,
              userId: record.userId,
              alarmEvent: null,
              alarmStatus: null,
              userResponsible:true,
              alarmHandlerTimeoutStatus: "TIMED_OUT",
            },
          });
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
        })
        .then(res => {
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
        .catch(error => {
          state.exportLoading = false;
        });
    };
    return {
      ...toRefs(state),
      clickSlot,
      expordTable,
      statisticTable,
    };
  },
});
</script>

<style></style>
