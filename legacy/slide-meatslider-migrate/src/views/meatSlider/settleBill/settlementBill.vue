<template lang="pug">
div
  g-table(
    title="结算账单"
    :api="api"
    :search="search"
    :columns="columns"
    :btns="[]"
    tableCode="SETTLEMENT_BILL",
    :rowSelection="true"
    ref="tableRef"
    :tableCheckbox="tableCheckbox"
  )
    template(v-slot:btn="item")
      a-button(:disabled="item.record.status" @click="confirm(item.record)" type="link") 结算确认
    template(v-slot:batch="item")
      a-button(type="primary" @click="batchConfig(item.record)" :disabled="item.record&&item.record.length === 0") 批量结算
  a-modal(
    v-model:visible="visible" 
    :title="modalTitle" 
    :icon="icon"
    centered
    @Ok="settlement") 
    div
    a-form(:model="model" :rules="rules" ref="passwordForm") 
      a-form-item(label="请输入密码" name="password")    
        a-input-password(v-model:value="model.password" placeholder="请输入密码")
    div
      span.deleteRow (确认后结算金额将划到商家账户，此操作不可逆）
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import { settleStatus } from "@/utils/enumerate.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  watch,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
// import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import {
  CaretDownOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons-vue";
import { timeFormat, millennial } from "@/utils/common";
import { Modal } from "ant-design-vue";
export default defineComponent({
  components: {
    InfoCircleOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "settlementCode",
        "supplierName",
        "supplierCode",
        "orderCode",
        "amount",
        "commission",
        "initiateTime",
        "status",
        "settlementTime",
        "action",
      ],
      // columnList: [
      //   "settlementCode",
      //   "merchantName",
      //   "merchantCode",
      //   "orderCode",
      //   "amount",
      //   "commission",
      //   "initiateTime",
      //   "status",
      //   "settlementTime",
      //   "action",
      // ],
      columns: [
        {
          mark: "settlementCode",
          dataIndex: "settlementCode",
          key: "settlementCode",
          title: "结算单号",
          slots: {
            customRender: "settlementCode",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 90,
          ellipsis: true,
        },
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "supplierCode",
          dataIndex: "supplierCode",
          key: "supplierCode",
          title: "商家编号",
          slots: {
            customRender: "supplierCode",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "orderCode",
          dataIndex: "orderCode",
          key: "orderCode",
          title: "订单号",
          slots: {
            customRender: "orderCode",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "订单金额",
          slots: {
            customRender: "amount",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          // width: 90,
          ellipsis: true,
        },
        {
          mark: "commission",
          dataIndex: "commission",
          key: "commission",
          title: "订单佣金",
          slots: {
            customRender: "commission",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          // width: 90,
          ellipsis: true,
        }, {
          mark: "initiateTime",
          dataIndex: "initiateTime",
          key: "initiateTime",
          title: "生成时间",
          slots: {
            customRender: "initiateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
          // width: 180,
          ellipsis: true,
        },
        {
          mark: "status",
          dataIndex: "status",
          key: "status",
          title: "结算状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text) {
              return <g-table-dot content="已结算" />;
            } else {
              return <g-table-dot content="待结算" status="audit" />;
            }
          },
        },
        {
          mark: "settlementTime",
          dataIndex: "settlementTime",
          key: "settlementTime",
          title: "结算时间",
          slots: {
            customRender: "settlementTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
          // width: 180,
          ellipsis: true,
        },

        {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 100,
          fixed: "right",
        }
      ],
      api: {
        list: "settlement",
      },
      search: [
        {
          label: "结算状态",
          value: "status",
          component: "g-select",
          options: settleStatus,
          defaultValue: " ",
          placeholder: "请选择",
        },
        {
          label: "生成时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "订单号/结算单号" },
      ],
      icon: createVNode(CaretDownOutlined),
      password: null,
      modalTitle: "结算确认",
      batchData: [],
    });
    const condition = ref({
      keyword: null,
      status: null,
      pageNumber: 1,
      pageSize: 10,
    });

    const model = reactive({
      id: null,
      password: null,
      amount: null,
    });
    const visible = ref(false);

    const passwordForm = ref();
    const tableRef = ref();
    const rules = {
      password: [
        {
          required: true,
          message: "请输入",
        },
      ],
    };

    onMounted(() => {
      // state.columns = tableColumns("settlementManage", state.columnList);
    });

    const confirm = (record) => {
      model.id = record.id;
      model.amount = record.actualAmount;
      state.modalTitle = "结算确认";
      visible.value = true;
    };

    const batchConfig = (record) => {
      state.modalTitle = "批量结算确认";
      state.batchData = tableRef.value.dataSource.filter(
        (item) => record.indexOf(item.id) > -1
      );
      model.amount = 0;
      state.batchData.forEach((item) => {
        model.amount += Number(item.actualAmount);
      });
      model.amount = model.amount.toFixed(2);
      visible.value = true;
    };

    const tableCheckbox = (record) => {
      if (record) {
        return record.status;
      }
    };

    watch(
      () => state.password,
      () => {
      }
    );

    const settlement = () => {
      if (state.modalTitle === "结算确认") {
        passwordForm.value.validate().then(() => {
          proxy.$api
            .settleId(model, "put")
            .then((res) => {
              proxy.$message.success("操作成功");
            })
            .finally(() => {
              visible.value = false;
              model.id = null;
              model.password = null;
              tableRef.value.getData();
            });
        });
      } else {
        passwordForm.value.validate().then(() => {
          proxy.$api
            .batchSettleId({
              password: model.password,
              orderSettles: state.batchData.map((item) => {
                return {
                  settleId: item.id,
                  supplierId: item.supplierId,
                };
              }),
            }, "put")
            .then((res) => {
              proxy.$message.success("操作成功");
            })
            .finally(() => {
              visible.value = false;
              model.id = null;
              model.password = null;
              tableRef.value.getData();
            });
        });
      }
    };

    return {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 20,
      },
      ...toRefs(state),
      model,
      visible,
      rules,
      passwordForm,
      tableRef,
      settleStatus,
      confirm,
      batchConfig,
      settlement,
      tableCheckbox,
    };
  },
});
</script>
<style scoped lang="less"></style>
