<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    editMode="page"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns"
    tableCode="PATROL_RECORD"
  ></g-table>
</template>
<script lang="jsx">
import { defineComponent, reactive, ref, toRefs, getCurrentInstance } from "vue";
import { xlLine } from "@/api/monitor.js";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const getLine = async () => {
      let res = await xlLine();

      state.search = [
        {
          label: "巡逻时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "巡逻路线",
          value: "cameraPatrolLineId",

          options: res.map((data) => {
            data.label = data.name;
            data.value = data.id;
            return data;
          }),
          component: "a-select",
          placeholder: "请选择巡逻路线",
        },
      ];
    };
    getLine();

    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "patrolRecord",
        path: "/recordDetail",
      },
      btns: ["detail"],
      search: [
        {
          label: "巡逻时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
      ],
      columns: [
        {
          dataIndex: "patrolTime",
          title: "巡逻时间",
          slots: {
            customRender: "patrolTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "cameraPatrolLineName",
          title: "巡逻路线名称",
          slots: {
            customRender: "cameraPatrolLineName",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "userName",
          title: "巡逻人员",
          align: "center",
          slots: {
            customRender: "userName",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "duration",
          title: "巡逻耗时",
          align: "center",
          slots: {
            customRender: "duration",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "num",
          title: "巡逻点数",
          align: "center",
          slots: {
            customRender: "num",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "completeNum",
          title: "本次巡逻点数",
          align: "center",
          slots: {
            customRender: "completeNum",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "abnormalNum",
          title: "异常数",
          align: "center",
          slots: {
            customRender: "abnormalNum",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "0"}</PopOver>;
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width: 100,
          slots: {
            customRender: "action",
          },
        },
      ],
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style></style>
