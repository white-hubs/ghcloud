<template>
  <g-table tableCode="INSPECTION_TASK" :title="pageTitle" :columns="columns" :api="api" :search="search" :btns="btns" :slots="slots"
    :rowSelection="rowSelection" :editMode="'page'" :rules="rules" @slot="operation" :beforeGet="beforeGet"
    ref="tableRef">
    <template v-slot:pre-item>
      <div class="mr1">
        <a-button @click="changeBtnStatus('all')" :type="btnStatus === 'all' ? 'primary' : 'default'">全部</a-button>
        <a-button @click="changeBtnStatus('SPLIT')" :type="btnStatus === 'SPLIT' ? 'primary' : 'default'">
          待拆解
        </a-button>
        <a-button @click="changeBtnStatus('CONFIRM')" :type="btnStatus === 'CONFIRM' ? 'primary' : 'default'">
          待确认
        </a-button>
        <a-button @click="changeBtnStatus('EXECUTING')" :type="btnStatus === 'EXECUTING' ? 'primary' : 'default'">
          待巡检
        </a-button>
        <a-button @click="changeBtnStatus('OVER')" :type="btnStatus === 'OVER' ? 'primary' : 'default'">
          已完成
        </a-button>
        <a-button @click="changeBtnStatus('EXPIRE')" :type="btnStatus === 'EXPIRE' ? 'primary' : 'default'">
          已过期
        </a-button>
        <a-button @click="changeBtnStatus('STOP')" :type="btnStatus === 'STOP' ? 'primary' : 'default'">
          已终止
        </a-button>
      </div>
    </template>
    <template v-slot:btn="{ record }">
      <a-button type="link" @click="detail(record)">详情</a-button>
      <a-button type="link" v-if="record.status == 'SPLIT'" @click="disassembly(record)">任务拆解</a-button>
      <a-popconfirm v-if="record.status === 'EXECUTING'" title="是否停止巡检计划？" cancelText="取消" okText="确定" @confirm.stop="stop(record)">
        <a-button type="link">停止</a-button>
      </a-popconfirm>
      <a-button v-else disabled type="link">停止</a-button>
      <a-popconfirm v-if="useBusinessDelete" title="是否删除巡检任务？" cancelText="取消" okText="确定" @confirm="businessDelete(record)">
        <a-button type="link" danger>删除</a-button>
      </a-popconfirm>
    </template>
    <template #header-btns>
      <a-button type="primary" @click="goAdd">
        新增
      </a-button>
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
import { usePageName, useFeature } from '@ghcloud/cube-utils'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'


export default defineComponent({
  components: {
  },
  setup() {
    const { pageTitle } = usePageName()
    // const { getBimopsWebManageFeature } = useFeature()
    // const { useBusinessDelete } = getBimopsWebManageFeature()
    // 由特性 改为 权限控制
    const permission = appFunctionCodes.inspectTask
    const useBusinessDelete = hasPermission(permission.deleted)

    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const router = useRouter();

    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "任务名称",
          slots: {
            customRender: "name",
          },
          align:'center',
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
          slots: {
            customRender: "typeName",
          },
          align:'center',
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
          dataIndex: "isCheck",
          title: "任务类型",
          slots: {
            customRender: "isCheck",
          },
          align:'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? '稽查' : "普通"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "receiveNames",
          title: "执行人",
          slots: {
            customRender: "receiveNames",
          },
          align:'center',
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
          dataIndex: "publisherName",
          title: "发布人",
          slots: {
            customRender: "publisherName",
          },
          align:'center',
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
          dataIndex: "createTime",
          title: "发布时间",
          slots: {
            customRender: "createTime",
          },
          align:'center',
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
          dataIndex: "validEndTime",
          title: "截止时间",
          slots: {
            customRender: "validEndTime",
          },
          align:'center',
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
          dataIndex: "targetNum",
          title: "巡检对象数",
          slots: {
            customRender: "targetNum",
          },
          align:'center',
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
          dataIndex: "recordCompletionRate",
          title: "进度",
          slots: {
            customRender: "recordCompletionRate",
          },
          align:'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) *100 + "%" : ""}
              >
                {text || text === 0 ? millennial(text, true)*100 + "%" : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "状态",
          
          slots: {
            customRender: "status",
          },
          align:'center',
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "EXECUTING") {
              return <g-table-dot content="待巡检" status="audit" />;
            } else if (text === "OVER") {
              return <g-table-dot content="已完成" status="normal" />;
            } else if (text === "EXPIRE") {
              return <g-table-dot content="已过期" status="delete" />;
            } else if (text === "STOP") {
              return <g-table-dot content="已终止" status="delete" />;
            } else if (text === "CONFIRM") {
              return <g-table-dot content="待确认" status="delete" />;
            } else if (text === "SPLIT") {
              return <g-table-dot content="待拆解" status="delete" />;
            } else if (text === "ACCEPT") {
              return <g-table-dot content="待接收" status="audit" />;
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          align:'left',
          fixed: "right",
          width: 180,
        },
      ],
      api: {
        list: "inspectTaskPageV2",
        path: "/inspectionTaskDetails",
      },
      btns: [],
      search: [
        {
          label: "巡检类型",
          value: "typeId",
          component: "g-select",
          url: "inspectTypeList",
          field: { name: "label", id: "value" },
          placeholder: "请选择巡检类型",
        },
        {
          label: "发布时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
          placeholder: "名称",
        },
        { label: "", value: "keyword", placeholder: "名称" },
      ],
      slots: [{ slot: "taskStatus", component: "a-switch" }],
      rowSelection: false,
      btnStatus: "all",
    });

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
      tableRef.value.searchRecord();
    };

    const operation = async (slot, record) => {
      await proxy.$api.inspectPlanStatus("put", {
        id: record.id,
        startFlag: record.taskStatus,
      });
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    const stop = async (record) => {
      await proxy.$api.taskStatus(record.id, "put");
      proxy.$message.success("任务已停止");
      tableRef.value.getData();
    };

    const detail = (record) => {
      router.push({
        path: "/inspectionTaskDetails",
        query: { id: record.id, type: "detail", flag: 'true' },
      });
    };
    const goAdd = (record) => {
      router.push({
        path: "/addTask",
      });
    };
    const disassembly = (record) => {
      router.push({
        path: "/inspectionTaskDisassembly",
        query: { id: record.id },
      });
    };

    const beforeGet = (params) => {
      return {
        ...params,
        status: state.btnStatus === "all" ? null : state.btnStatus,
      };
    };

    const businessDelete = async (record) => {
      proxy.$message.loading("删除中...",0);
      try {
        await proxy.$api.batchRemoveInspectTask({
          idList: [record.id],
        });
        proxy.$message.destroy();
        proxy.$message.success("删除成功");
      } catch (error) {
        proxy.$message.destroy();
        proxy.$message.error("删除失败");
      } finally {
        tableRef.value.getData();
      }


    };


    return {
      tableRef,
      ...toRefs(state),
      changeBtnStatus,
      operation,
      beforeGet,
      detail,
      goAdd,
      disassembly,
      stop,
      businessDelete,
      pageTitle,
      useBusinessDelete
    };
  },
});
</script>
