<template>
  <div class="ctr">
    <g-table
      title="委外工单"
      :columns="columns"
      :api="api"
      :search="search"
      :btns="btns"
      :rowSelection="rowSelection"
      :editMode="'page'"
      :beforeGet="beforeGet"
      ref="tableRef"
      :scrollX="600"
    >
      <template v-slot:pre-item>
        <div class="mr1">
          <a-button
            @click="changeBtnStatus('all')"
            :type="btnStatus === 'all' ? 'primary' : 'default'"
            >全部任务</a-button
          >
          <a-button
            @click="changeBtnStatus('WAIT_RECEIVE')"
            :type="btnStatus === 'WAIT_RECEIVE' ? 'primary' : 'default'"
          >
            待接收
          </a-button>
          <a-button
            @click="changeBtnStatus('WAIT_HANDLE')"
            :type="btnStatus === 'WAIT_HANDLE' ? 'primary' : 'default'"
          >
            待处理
          </a-button>
          <a-button
            @click="changeBtnStatus('WAIT_ACCEPTANCE')"
            :type="btnStatus === 'WAIT_ACCEPTANCE' ? 'primary' : 'default'"
          >
            待验收
          </a-button>
          <a-button
            @click="changeBtnStatus('COMPLETED')"
            :type="btnStatus === 'COMPLETED' ? 'primary' : 'default'"
          >
            已结束
          </a-button>
        </div>
      </template>
      <template v-slot:btn="{ record }">
        <!-- record.ticketStatus !== 'COMPLETED' && -->
        <!-- <a-button type="link" @click="detail(record)">详情</a-button> -->
        <a-button
          type="link"
          @click="openModal(record)"
          :disabled="!record.isCanAssessmented"
        >
          评价
        </a-button>
      </template>
    </g-table>
    <a-modal
      v-model:visible="visible"
      title="评价委外维修"
      centered
      @ok="save"
      @cancel="cancel"
    >
      <a-form ref="modalForm" :model="model" :rules="rules">
        <a-form-item label="工单评价" name="score">
          <a-rate v-model:value="model.score"></a-rate>
        </a-form-item>
        <a-form-item label="评价描述" name="description">
          <a-textarea
            v-model:value="model.description"
            :maxlength="200"
            placeholder="评价描述"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="评价图片">
          <g-upload
            v-model:value="model.imageIdList"
            :businessKey="'maintain'"
            :file="model.fileList"
          ></g-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
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
// import { replaceObjectKeys } from '@pansy/utils'
// import { planStatus } from '@/utils/enumerate'
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const modalForm = ref();
    const router = useRouter();

    const state = reactive({
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
          dataIndex: "deviceObjectName",
          title: "维修对象",
          slots: {
            customRender: "deviceObjectName",
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
          dataIndex: "outsourceCompanyName",
          title: "委外公司",
          slots: {
            customRender: "outsourceCompanyName",
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
          dataIndex: "outsourceModelName",
          title: "委外模式",
          slots: {
            customRender: "outsourceModelName",
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
          dataIndex: "ticketStatus",
          title: "状态",
          slots: {
            customRender: "ticketStatus",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "WAIT_HANDLE") {
              return <g-table-dot content="待处理" status="audit" />;
            } else if (text === "WAIT_RECEIVE") {
              return <g-table-dot content="待接收" status="audit" />;
            } else if (text === "WAIT_ACCEPTANCE") {
              return <g-table-dot content="待验收" status="audit" />;
            } else if (text === "COMPLETED") {
              return <g-table-dot content="已结束" status="normal" />;
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "handleResult",
          title: "处理结果",
          slots: {
            customRender: "handleResult",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "RECEIVE") {
              return "接收工单";
            } else if (text === "RESOLVED") {
              return "已解决";
            } else if (text === "REFUSE") {
              return "拒绝工单";
            } else if (text === "UNSOLVED") {
              return "未解决";
            } else if (text === "ACCEPTANCE_SUCCESS") {
              return "验收成功";
            } else if (text === "ACCEPTANCE_FAIL") {
              return "验收失败";
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
          fixed: "right",
          // width: 200,
        },
      ],
      api: {
        list: "repairOrderList",
        path: "/repairOrderDetails",
        deleteSingle: "",
      },
      btns: ["deleteSingle", "detail"],
      search: [
        {
          label: "委外公司",
          value: "outsourceCompanyId",
          component: "g-select",
          url: "repairCompany",
          field: { name: "label", id: "value" },
        },
        {
          label: "工单时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        { label: "", value: "name", placeholder: "名称" },
      ],
      visible: false,
      rowSelection: false,
      btnStatus: "all",
      model: {
        score: "",
        fileList: [],
        imageIdList: [],
        description: "",
        outsourceRepairTicketId: "",
      },
    });

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
      tableRef.value.getData();
    };

    const detail = (record) => {
      router.push({
        path: "/inspectionTaskDetails",
        query: { id: record.id, type: "detail" },
      });
    };

    const beforeGet = (params) => {
      return {
        ...params,
        ticketStatus: state.btnStatus === "all" ? "" : state.btnStatus,
      };
    };

    const openModal = (record) => {
      state.model.outsourceRepairTicketId = record.id;
      state.visible = true;
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        const params = {
          ...state.model,
          imageIdList: state.model.imageIdList
            ? state.model.imageIdList.split(",")
            : [],
        };
        proxy.$api.repairOrderEval(params, "post").then(() => {
          proxy.$message.success("操作成功");
          cancel();
          tableRef.value.getData();
        });
      });
    };

    const cancel = async () => {
      await modalForm.value.resetFields();
      state.model.score = "";
      state.model.fileList = [];
      state.model.description = "";
      state.model.imageIdList = [];
      state.visible = false;
    };

    onMounted(function(){});

    return {
      tableRef,
      modalForm,
      ...toRefs(state),
      changeBtnStatus,
      beforeGet,
      openModal,
      detail,
      cancel,
      save,
      stop,
    };
  },
});
</script>
<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
}
</style>
