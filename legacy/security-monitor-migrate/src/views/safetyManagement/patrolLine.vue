<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    editMode="page"
    :api="api"
    :btns="btns"
    :search="search"
    :rowSelection="true"
    :columns="columns"
    :slots="slots"
    @slot="updateEnabled"
    tableCode="PATROL_LINE"
  >
    <template v-slot:btn="{ record }">
      <a-button type="link" @click="handelDetail(record)">详情</a-button>
      <a-button type="link" @click="goPatrol(record)">巡逻</a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import { defineComponent, reactive, toRefs, getCurrentInstance, ref } from "vue";
import { useRouter } from "vue-router";
import { usePageName } from "@ghcloud/cube-utils"
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
export default defineComponent({
  setup() {
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "patrolLine",
        path: "/addLine",
        deleteSingle: "patrolLineId",
        delete: "patrolLineBatch1",
      },
      btns: ["add", "edit", "deleteSingle", "delete"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "线路名称",
        },
      ],
      columns: [
        {
          dataIndex: "name",
          title: "路线名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "cameraNum",
          title: "监控点数",
          slots: {
            customRender: "cameraNum",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text || text === 0 ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "createByName",
          title: "创建人员",
          slots: {
            customRender: "createByName",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "patrolProposalTime",
          title: "建议巡逻时间",
        },
        {
          dataIndex: "createTime",
          title: "创建时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? timeFormat(text, true) : "--"}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "patrolNum",
          title: "巡逻次数",
        },
        {
          dataIndex: "patrolLastTime",
          title: "最近巡逻时间",
          slots: {
            customRender: "patrolLastTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "patrolUserNames",
          title: "巡逻人员",
          slots: {
            customRender: "patrolUserNames",
          },
          customRender: ({ text }) => {
            return <PopOver content={text ? text : "--"}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          title: "是否启用",
          dataIndex: "enabled",
          key: "enabled",
          slots: {
            customRender: "enabled",
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          width: 200,
          slots: {
            customRender: "action",
          },
        },
      ],
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
    });
    const goPatrol = (record) => {
      history.pushState(
        {},
        "",
        `/portal/securityMonitoring/implementPatro?id=${record.id}`
      );
      // router.push({ path: "/implementPatro", query: { id: record.id } });
    };
    const updateEnabled = async (key, record) => {
      const data = await proxy.$api.editPatrolLineState(record.id, record.enabled);
      if (data) {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      }
    };
    const handelDetail = (record) => {
      history.pushState(
        {},
        "",
        `/portal/securityMonitoring/patrolLineDetail?id=${record.id}`
      );
      // router.push({ path: "/patrolLineDetail", query: { id: record.id } });
    };
    return {
      ...toRefs(state),
      goPatrol,
      updateEnabled,
      handelDetail,
      tableRef,
    };
  },
});
</script>

<style></style>
