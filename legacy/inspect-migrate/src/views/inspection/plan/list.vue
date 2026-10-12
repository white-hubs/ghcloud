<template>
  <g-table tableCode="INSPECTION_PLAN" :title="pageTitle" :columns="columns" :api="api" :search="search" :btns="btns"
    :slots="slots" :rowSelection="rowSelection" :editMode="'page'" :rules="rules" @slot="operation"
    :beforeGet="beforeGet" ref="tableRef">
    <template v-slot:pre-item>
      <div class="mr1">
        <a-button @click="changeBtnStatus('all')" :type="btnStatus === 'all' ? 'primary' : 'default'">全部任务</a-button>
        <a-button @click="changeBtnStatus('EXECUTING')"
          :type="btnStatus === 'EXECUTING' ? 'primary' : 'default'">执行中</a-button>
        <a-button @click="changeBtnStatus('OVER')" :type="btnStatus === 'OVER' ? 'primary' : 'default'">已结束</a-button>
        <a-button @click="changeBtnStatus('STOP')" :type="btnStatus === 'STOP' ? 'primary' : 'default'">已停用</a-button>
      </div>
    </template>
    <template v-slot:btn="{ record }">
      <a-button type="link" @click="detail(record)">详情</a-button>
      <a-button type="link" @click="edit(record)">编辑</a-button>
      <a-button type="link" @click="copy(record)">复制</a-button>
      <a-popconfirm title="是否确认删除？" cancelText="取消" okText="确定" @confirm.stop="deleteRecord(record)">
        <a-button type="link" danger>删除</a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@/utils/common";
import { useRouter } from "vue-router";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const router = useRouter();
    const { pageTitle } = usePageName()
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "名称",
          align: 'center',
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "typeName",
          title: "巡检类型",
          align: 'center',
          slots: {
            customRender: "typeName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "receiveType",
          title: "执行部门/人",
          align: 'center',
          slots: {
            customRender: "receiveType",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (text == "1") {
              return (
                <PopOver
                  position="topLeft"
                  content={record?.receiveNames ? record?.receiveNames : ""}
                >
                  {record?.receiveNames ? record?.receiveNames : "--"}
                </PopOver>
              );
            } else {
              if (record?.receiveDeptNames && record?.receivePostNames) {
                return (
                  <PopOver
                    position="topLeft"
                    content={
                      record?.receiveDeptNames + "/" + record?.receivePostNames
                    }
                  >
                    {record?.receiveDeptNames + "/" + record?.receivePostNames}
                  </PopOver>
                );
              } else if (record?.receiveDeptNames || record?.receivePostNames) {
                return (
                  <PopOver
                    position="topLeft"
                    content={
                      record?.receiveDeptNames + record?.receivePostNames
                    }
                  >
                    {record?.receiveDeptNames + record?.receivePostNames}
                  </PopOver>
                );
              } else if (record?.receiveRoleNames) {
                return <PopOver
                  position="topLeft"
                  content={
                    record?.receiveRoleNames
                  }
                >
                  {record?.receiveRoleNames}
                </PopOver>
              } else {
                return "--";
              }
            }
          },
        },
        {
          dataIndex: "targetNum",
          title: "巡检对象数",
          align: 'center',
          slots: {
            customRender: "targetNum",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, false) : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "validEndTime",
          title: "失效时间",
          align: 'center',
          slots: {
            customRender: "validEndTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "状态",
          align: 'center',
          slots: {
            customRender: "status",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "EXECUTING") {
              return <g-table-dot content="执行中" status="normal" />;
            } else if (text === "OVER") {
              return <g-table-dot content="已结束" status="audit" />;
            } else if (text === "STOP") {
              return <g-table-dot content="已停用" status="delete" />;
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "createByName",
          title: "创建人",
          align: 'center',
          slots: {
            customRender: "createByName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text}
              >
                {text}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "创建时间",
          align: 'center',
          slots: {
            customRender: "createTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ''}
              >
                {text ? timeFormat(text, true) : ''}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enable",
          title: "停用/启用",
          align: 'center',
          slots: {
            customRender: "enable",
          },
          component: "a-switch",
          fixed: "right",
          width: 100,
        },
        // {
        // 	dataIndex: 'taskStatus',
        // 	title: '执行状态',
        // 	slots: {
        // 		customRender: 'taskStatus'
        // 	},
        // 	ellipsis: true
        // },
        {
          dataIndex: "action",
          title: "操作",
          align: 'center',
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 200,
        },
      ],
      api: {
        list: "inspectPlan",
        deleteSingle: "inspectPlanId",
        // delete: "inspectPlanId",
        path: "/inspectionPlanOperate",
      },
      btns: ["add"],
      search: [
        {
          label: "巡检类型",
          value: "typeId",
          component: "g-select",
          url: "inspectTypeList",
          defaultValue: "",
          field: { name: "label", id: "value" },
          placeholder: "请选择巡检类型",
        },
        { label: "", value: "keywords", placeholder: "名称" },
      ],
      slots: [
        {
          slot: "taskStatus",
          component: "a-switch",
          unCheckedValue: "停止",
          checkedValue: "启用",
        },
        {
          slot: "enable",
          component: "a-switch",
          unCheckedValue: "停用",
          checkedValue: "启用",
        },
      ],
      rowSelection: false,
      btnStatus: "all",
    });

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
      tableRef.value.searchRecord();
    };

    const operation = async (record, status) => {
      proxy.$api
        .inspectPlanStatus(
          {
            id: status.id,
            startFlag: status.enable,
          },
          "put"
        )
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
    };

    const stop = async (record) => {
      await proxy.$api.taskStatus("put", {
        id: record.id,
        statusValue: "STOP",
      });
      proxy.$message.success("任务已停止");
      tableRef.value.getData();
    };

    const detail = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/inspection/inspectionPlanOperate?id=${record.id}&type=detail`)
    };

    const copy = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/inspection/inspectionPlanOperate?id=${record.id}&type=copy`)
    };
    const deleteRecord = (record) => {
      proxy.$api.inspectPlanId(record.id, "delete").then(() => {
        proxy.$message.success("删除成功");
        tableRef.value.getData();
      });
    };
    const edit = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/inspection/inspectionPlanOperate?id=${record.id}&type=edit`)
    };

    const beforeGet = (params) => {
      let status;
      switch (state.btnStatus) {
        case "all":
          status = "";
          break;
        case "EXECUTING":
          status = "EXECUTING";
          break;
        case "OVER":
          status = "OVER";
          break;
        case "STOP":
          status = "STOP";
          break;
      }
      return { ...params, status: status };
    };

    onMounted(() => { });

    return {
      ...toRefs(state),
      changeBtnStatus,
      operation,
      beforeGet,
      tableRef,
      detail,
      stop,
      copy,
      edit,
      deleteRecord,
      pageTitle
    };
  },
});
</script>
