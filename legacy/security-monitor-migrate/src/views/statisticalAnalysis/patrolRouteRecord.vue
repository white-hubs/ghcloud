<template>
  <g-table 
    :title="pageTitle"
    ref="tableData"
    :api="api"
    :btns="[]"
    :columns="columns"
    tableCode="PATROL_RECORD_BY_LINE_ID"
  >
    <template #header-btn>
      <a-button type="primary" :loading="exportLoading" @click="exportTable">
        导出
      </a-button>
    </template>
    <template #batch>
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const tableData = ref(null);
    const { period, cameraPatrolLineId, path } = route.query;
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      exportLoading: false,
      columns: [
        {
          dataIndex: "patrolTime",
          title: "巡逻时间",
          slots: {
            customRender: "patrolTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "cameraPatrolLineName",
          title: "巡逻路线名称",
        },
        {
          dataIndex: "userName",
          title: "巡逻人员",
        },
        {
          dataIndex: "duration",
          title: "巡逻耗时",
        },
        {
          dataIndex: "num",
          title: "巡逻点数",
        },
        {
          dataIndex: "completeNum",
          title: "本次巡逻点数",
        },
        {
          dataIndex: "abnormalNum",
          title: "异常数",
        },
      ],
      search: [
        {
          label: "",
          components: "span",
          value: "period",
          defaultValue: period,
        },
        {
          label: "",
          components: "span",
          value: "cameraPatrolLineId",
          defaultValue: cameraPatrolLineId,
        },
      ],
      api: {
        list: "patrolRecord",
      },
    });
    const goBack = () => {
      history.back();
      // history.go(-1);
      // router.push(`/${path}`)
    };
    const exportTable = () => {
      state.exportLoading = true;

      let period = tableData.value.searchForm.period;
      proxy.$api
        .patrolLineRecordStatisticExport({
          period: period,
          cameraPatrolLineId: tableData.value.searchForm.cameraPatrolLineId,
        })
        .then((res) => {
          state.exportLoading = false;
          const link = document.createElement("a");
          let blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "巡逻记录统计.xlsx");
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
      goBack,
      exportTable,
      tableData,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.content-search) {
  padding-top: 0 !important;
}
</style>
