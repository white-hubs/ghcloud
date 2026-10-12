<template>
  <g-table
    ref="statisticTable"
    :title="pageTitle"
    :api="api"
    :search="search"
    :btns="[]"
    :columns="columns"
    tableCode="PATROL_LINE_STATISTICS"
  >
    <template #header-btns>
      <a-button type="primary" :loading="exportLoading" @click="exportTable">
        导出
      </a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
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
        list: "cameraPatrolStatistics",
      },
      search: [
        {
          label: "巡逻时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入路线名称",
        },
      ],
      columns: [
        {
          dataIndex: "tableIndex",
          title: "序号",
          customRender: ({ record, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "name",
          title: "巡逻路线",
        },
        {
          dataIndex: "cameraNum",
          title: "监控点数",
        },
        {
          dataIndex: "patrolUserNames",
          title: "巡逻人员",
        },
        {
          dataIndex: "patrolNum",
          title: "巡逻次数",
          customRender: ({ text, record, index }) => {
            return <a-button type="link" onClick={() => clickSlot('patrolNum',record)}>{text}</a-button>;
          },
        },
        {
          dataIndex: "abnormalNum",
          title: "异常总数",
        },
      ],
      slots: [
        {
          slot: "patrolNum",
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
    const clickSlot = (slot, record) => {
      let period = statisticTable.value.form.period;
      const info = {
        period: period == null ? "" : period,
        cameraPatrolLineId: record.id,
        path: window.location.pathname.split("/").reverse()[0],
      };
      history.pushState(
        { current: location.pathname + location.search },

        "",
        `/portal/securityMonitoring/patrol/record?${getQuery(info)}`
      );
    };
    const exportTable = () => {
      state.exportLoading = true;
      let period = statisticTable.value.form.period;
      let keyword = statisticTable.value.form.keyword;
      proxy.$api
        .patrolStatisticExport({
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
          link.setAttribute("download", "巡逻路线统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((err) => {
          state.exportLoading = false;
        });
    };
    return {
      ...toRefs(state),
      statisticTable,
      clickSlot,
      exportTable,
    };
  },
});
</script>

<style></style>
