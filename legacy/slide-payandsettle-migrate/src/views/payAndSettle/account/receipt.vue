<template lang="pug">
div
  g-table(
      title="收款单"
      :api="api"
      :columns="columns"
      :search="search"
      :btns="btns"
      editMode="page"
      ref="tableRef"
  )
    template(v-slot:btn="{record}")
      a-button(type="link" @click="clickCollection(record)") 收款
      a-button(type="link" @click="clickDetail(record)") 详情
  a-modal(v-model:visible.sync="modalVisible" v-if="modalVisible" width="600px" title="收款"  :closable="false"  @ok="submitModal" centered)
    a-form(:model="modalForm" :rules="rules" ref="formRef" :label-col="{span: 4 }")
      a-form-item(label="收款金额" name="amount") {{modalForm.amount}}
      a-form-item(label="收款方式" name="payTypeId")
        g-select(v-model:value="modalForm.payTypeId" url="getDictIncomePayChannel"  :field="{ id: 'value', payTypeName: 'label' }")
       
  
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  computed,
} from "vue";
import { workOrderStatus } from "@/utils/enumerate";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { timeFormat } from "@/utils/common";

export default defineComponent({
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const formRef = ref();
    const router = useRouter();
    const state = reactive({
      api: {
        list: "getReceiptListPage",
        path: "/addWorkOrder",
      },
      btns: [],
      columns: [
        {
          dataIndex: "businessKey",
          title: "业务单号",
          slots: { customRender: "businessKey" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "businessTypeName",
          title: "业务类型",
          slots: { customRender: "businessTypeName" },
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
          title: "单据时间",
          slots: { customRender: "createTime" },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : "--"}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "amount",
          title: "缴费金额",
          slots: { customRender: "amount" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payer",
          title: "缴费人",
          slots: { customRender: "payer" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
          width: 100,
        },
      ],
      search: [
        {
          label: "业务类型",
          value: "command",
          component: "g-select",
          url: "getDictBussinessCommand",
          placeholder: "请选择",
          field: { businessCommand: "value", commandName: "label" },
        },
        {
          label: "单据时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "关键字搜索",
        },
        {
          value: "status",
          defaultValue: "1",
          component: "span",
        },
      ],
      modalVisible: false,
      modalTitle: "激活市场虚拟帐户",
      modalForm: {
        id: "",
        payTypeId: "",
        amount: "",
        payScene: "",
        payTime: "",
      },
      rules: {
        payTypeId: [
          {
            required: true,
            message: "请选择收款方式",
          },
        ],
      },
    });
    // 点击详情
    const clickDetail = (record) => {
      switch (record.command) {
        case "CAR_CARD":
          history.pushState({},'',`/portal/payAndSettle/parkVehDetail?id=${record.businessKey}&type=${detail}&url=${businessKey}`)
          
          break;
        default:
          break;
      }
    };
    //  点击收款
    const clickCollection = (record) => {
      state.modalForm = {
        id: record.id,
        amount: record.amount,
        payTypeId: "",
        payScene: false,
        payTime: "",
      };
      state.modalVisible = true;
    };

    // 确认收款
    const submitModal = () => {
      formRef.value.validate().then((res) => {
        proxy.$api
          .postReceiptConfirm({
            ...state.modalForm,
          },"post")
          .then((res) => {
            state.modalVisible = false;
            proxy.$message.success("操作成功");
            tableRef.value.getData();
          });
      });
    };
    return {
      ...toRefs(state),
      clickDetail,
      clickCollection,
      submitModal,
      tableRef,
      formRef,
    };
  },
});
</script>
