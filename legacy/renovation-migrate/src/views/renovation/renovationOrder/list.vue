<template>
  <g-table
    ref="tableRef"
    title="更新改造工单"
    :api="api"
    :columns="columns"
    :search="search"
    :btns="btns"
    :rowKey="'id'"
    :beforeGet="beforeGet"
    :editMode="'page'"
  >
    <template v-slot:pre-item>
      <div class="mr1">
        <a-button
          @click="changeBtnStatus('all')"
          :type="btnStatus === 'all' ? 'primary' : 'default'"
        >
          所有
        </a-button>
        <a-button
          @click="changeBtnStatus('WAITING_HANDLE')"
          :type="btnStatus === 'WAITING_HANDLE' ? 'primary' : 'default'"
        >
          待处理
        </a-button>
        <a-button
          @click="changeBtnStatus('COMPLETED')"
          :type="btnStatus === 'COMPLETED' ? 'primary' : 'default'"
        >
          已完成
        </a-button>
      </div>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "renovationOrder",
        path: "/renovationOrderDetails",
        deleteSingle: "renovationOrderId",
        pathParams: [{ value: "hiddenDangerId", key: "id" }],
      },
      search: [
        {
          label: "工单时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: ["开始时间", "结束时间"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "设备名称",
        },
      ],
      btns: ["detail", "deleteSingle"],
      columns: [
        {
          dataIndex: "code",
          title: "工单编号",
          slots: {
            customRender: "code",
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
          dataIndex: "retrofitObjectName",
          title: "改造对象",
          slots: {
            customRender: "retrofitObjectName",
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
          dataIndex: "expectSolveDate",
          title: "期望解决时间",
          slots: {
            customRender: "expectSolveDate",
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
          dataIndex: "createTime",
          title: "工单时间",
          slots: {
            customRender: "createTime",
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
          slots: {
            customRender: "status",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  text ? (text === "WAITING_HANDLE" ? "待处理" : "已完成") : ""
                }
              >
                <g-table-dot
                  content={text === "WAITING_HANDLE" ? "待处理" : "已完成"}
                  status={text === "WAITING_HANDLE" ? "audit" : "normal"}
                />
              </PopOver>
            );
          },
        },
        {
          dataIndex: "handleResultStatusName",
          title: "处理结果",
          slots: {
            customRender: "handleResultStatusName",
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 120,
        },
      ],
      btnStatus: "all",
    });

    const beforeGet = (params) => {
      return {
        ...params,
        retrofitTicketStatus: state.btnStatus === "all" ? "" : state.btnStatus,
      };
    };

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
      tableRef.value.getData();
    };

    return {
      tableRef,
      ...toRefs(state),
      changeBtnStatus,
      beforeGet,
    };
  },
});
</script>
