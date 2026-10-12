<template>
  <g-table
    ref="tableRef"
    title="排查工单"
    :api="api"
    :columns="columns"
    :search="search"
    :btns="btns"
    :rowKey="'ticketId'"
    :beforeGet="beforeGet"
    :extraSearchModel="extraSearchModel"
    :editMode="'page'"
    :scrollX="800"
  >
    <template v-slot:pre-item>
      <div class="mr1">
        <a-button
          @click="changeBtnStatus('all')"
          :type="extraSearchModel.btnStatus === 'all' ? 'primary' : 'default'"
        >
          所有
        </a-button>
        <a-button
          @click="changeBtnStatus('PENDING')"
          :type="extraSearchModel.btnStatus === 'PENDING' ? 'primary' : 'default'"
        >
          待处理
        </a-button>
        <a-button
          @click="changeBtnStatus('TO_BE_CLOSED')"
          :type="extraSearchModel.btnStatus === 'TO_BE_CLOSED' ? 'primary' : 'default'"
        >
          待关闭
        </a-button>
        <a-button
          @click="changeBtnStatus('COMPLETED')"
          :type="extraSearchModel.btnStatus === 'COMPLETED' ? 'primary' : 'default'"
        >
          已结束
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
        list: "hiddenDangerOrder",
        path: "/checkDetails",
        deleteSingle: "",
        pathParams: [{ value: "hiddenDangerId", key: "id" }],
      },
      search: [
        {
          label: "隐患级别",
          value: "hiddenDangerLevelId",
          component: "g-select",
          url: "dangerDegree",
          field: { name: "label", id: "value" },
          placeholder: "隐患级别",
        },
        {
          label: "隐患分类",
          value: "hiddenDangerCategoryId",
          component: "g-select",
          field: { name: "label", id: "value" },
          url: "dangerCategory",
          placeholder: "隐患分类",
        },
        {
          label: "处理结果",
          value: "confirmResult",
          component: "g-select",
          options: [
            { label: "全部", value: "" },
            { label: "确认隐患", value: "CONFIRMED" },
            { label: "暂不处理", value: "UNTREATED" },
          ],
          placeholder: "处理结果",
        },
        {
          label: "时间",
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
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "hiddenObjName",
          title: "隐患对象",
          slots: {
            customRender: "hiddenObjName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "hiddenDangerCategoryName",
          title: "隐患分类",
          slots: {
            customRender: "hiddenDangerCategoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "hiddenDangerLevelName",
          title: "隐患级别",
          slots: {
            customRender: "hiddenDangerLevelName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "submitTime",
          title: "工单提交时间",
          slots: {
            customRender: "submitTime",
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
            let res;
            switch (text) {
              case "PENDING":
                res = "待处理";
                break;
              case "TO_BE_CLOSED":
                res = "待关闭";
                break;
              case "COMPLETED":
                res = "已结束";
                break;
              default:
                res = "--";
            }
            return (
              <PopOver content={text ? res : ""} position="topLeft">
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "result",
          title: "处理结果",
          slots: {
            customRender: "result",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            if (text === "UNRESOLVED") {
              res = "未解决";
            } else if (text === "RESOLVED") {
              res = "已解决";
            }
            return (
              <PopOver content={text ? res : ""} position="topLeft">
                {text ? res : "--"}
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
          // width: 200,
        },
      ],
    });
    const extraSearchModel = reactive({
      btnStatus: "all",
    });

    const beforeGet = (params) => {
      params.status = extraSearchModel.btnStatus === "all" ? "" : extraSearchModel.btnStatus;
      return params;
    };

    const changeBtnStatus = (type) => {
      extraSearchModel.btnStatus = type;
      tableRef.value.getData();
    };

    return {
      tableRef,
      extraSearchModel,
      ...toRefs(state),
      changeBtnStatus,
      beforeGet,
    };
  },
});
</script>
