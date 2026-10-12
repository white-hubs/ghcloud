<template lang="pug">
div 
  g-table(
    title="报备管理",
    :columns="columns",
    :search="search",
    :btns="btns",
    :editMode="editMode",
    :api="api",
    @operation="operation",
    ref="tableRef"
  )
    template(#header-btns)
      a-button(type="primary", @click="addReport") 来货报备
    template(v-slot:btn="{ record }")
      //- a-button(type="link" @click="openTheGate(item.record)" v-if="item.record.status === 'OVER_ENTER'") 开闸
      //- 未支付或未进场都不能开闸
      a-button(
        type="link",
        @click="setWeight('open', record)",
        :disabled="record.status !== 'OVER_ENTER' || record.payStatus !== 'PAY_SUCCESS'"
      ) 开闸
      //- 已支付或空&&待进场
      a-button(
        type="link",
        @click="setWeight('weight', record)",
        :disabled="record.status !== 'WAIT_ENTER' || record.payStatus === 'PAY_SUCCESS'"
      ) 设置重量
      a-button(
        type="link",
        @click="setWeight('recieve', record)",
        :disabled="record.status !== 'WAIT_ENTER' || record.payStatus !== 'WAIT_PAY'"
      ) 收款
      a-button(
        type="link",
        @click="setWeight('edit', record)",
        :disabled="record.status !== 'WAIT_ENTER' || record.payStatus !== 'WAIT_PAY'"
      ) 修改金额
  a-modal(
    v-model:visible.sync="modalVisible",
    width="600px",
    :title="modalTitle",
    @ok="submitModal",
    centered,
    @cancel="cancel",
    :okText="modalType === 'edit' ? '保存' : '确定'"
  )
    a-form(:model="modalForm", :rules="rules", ref="formRef")
      template(v-if="modalType === 'weight'") 
        a-form-item(label="计量单位", name="measureUnit")
          a-radio-group(v-model:value="modalForm.measureUnit")
            a-radio(value="KG") kg(公斤)
            a-radio(value="T") T(吨)
        a-form-item(label="计重方式", name="weightType")
          a-radio-group(v-model:value="modalForm.weightType")
            a-radio(value="WEIGH_VALUE") 按毛重
            a-radio(value="NET_WEIGHT") 按净重
        a-form-item(label="设置重量", name="weightValue")
          a-input(
            v-model:value="modalForm.weightValue",
            placeholder="请输入",
            :maxlength="10"
          )
      template(v-else-if="modalType === 'recieve'") 
        a-form-item(label="收款方式")
          span 现金
        a-form-item(label="应收金额")
          span {{ modalForm.shouldFee || modalForm.shouldFee === 0 ? `￥${millennial(modalForm.shouldFee)}` : '--' }}
        a-form-item(label="实收金额", name="realFee")
          a-input(
            v-model:value="modalForm.realFee",
            :maxlength="10",
            placeholder="请输入实收金额"
          ) 
      template(v-else-if="modalType === 'edit'") 
        a-form-item(label="应收金额")
          span {{ modalForm.shouldFee || modalForm.shouldFee === 0 ? `￥${millennial(modalForm.shouldFee)}` : '--' }}
        a-form-item(label="金额调整为", name="newFee")
          a-input(
            v-model:value="modalForm.newFee",
            :maxlength="10",
            placeholder="请输入调整金额"
          ) 
      a-form-item(
        :label="modalType === 'open' ? '开闸原因' : '备注'",
        :name="modalType === 'open' ? 'liftRodReason' : modalType === 'edit' ? 'remark' : ''",
        v-if="modalType !== 'recieve'"
      )
        a-textarea(
          v-model:value="modalForm[modalType === 'open' ? 'liftRodReason' : 'remark']",
          placeholder="请输入",
          :maxlength="200"
        )
      a-form-item(
        label="备注",
        name="remark",
        v-else-if="modalType === 'recieve' && modalForm.shouldFee != modalForm.realFee"
      )
        a-textarea(
          v-model:value="modalForm.remark",
          placeholder="请输入备注",
          :maxlength="200"
        )
</template>
<script lang='jsx'>
import {
  defineComponent,
  toRefs,
  reactive,
  ref,
  createVNode,
  getCurrentInstance,
} from "vue";
import { approachStatus } from "@/utils/enumerate";
import { replaceObjectKeys } from "@pansy/utils";
import { millennial, timeFormat } from "@/utils/common";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const formRef = ref();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      editMode: "page",
      api: {
        list: "entryFeeReport",
        path: "/approachReportDetail",
      },
      columns: [
        {
          dataIndex: "reportCode",
          title: "报备号",
          slots: {
            customRender: "reportCode",
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
          dataIndex: "reporter",
          title: "报备人",
          slots: {
            customRender: "reporter",
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
          dataIndex: "merchantName",
          title: "来货商家",
          slots: {
            customRender: "merchantName",
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
          dataIndex: "reportTime",
          title: "报备时间",
          slots: {
            customRender: "reportTime",
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
          dataIndex: "purchaseGoodsList",
          title: "来货商品",
          slots: {
            customRender: "purchaseGoodsList",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const arr = [];
            for (let i = 0; i < text?.length; i++) {
              if (text[i].goodsName) {
                arr.push(text[i].goodsName);
              }
            }
            return (
              <PopOver content={arr.length ? arr : ""} position="topLeft">
                {arr.length ? arr.join(",") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "placeOrigin",
          title: "产地",
          slots: {
            customRender: "placeOrigin",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carNo",
          title: "来货车辆",
          slots: {
            customRender: "carNo",
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
          dataIndex: "driverName",
          title: "送货司机",
          slots: {
            customRender: "driverName",
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
          dataIndex: "stallName",
          title: "交易区（档位）",
          slots: {
            customRender: "stallName",
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
          dataIndex: "certificate",
          title: "检测合格证号",
          slots: {
            customRender: "certificate",
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
          dataIndex: "enterTime",
          title: "进场时间",
          slots: {
            customRender: "enterTime",
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
          title: "进场状态",
          slots: {
            customRender: "status",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (text === "WAIT_ENTER") {
              return <g-table-dot content="待进场" status="audit" />;
            } else if (text === "OVER_ENTER") {
              return <g-table-dot content="已进场" />;
            } else {
              if (text === "CANCEL_ENTER") {
                return <g-table-dot content="已取消" status="delete" />;
              }
              return <g-table-dot content="已失效" status="delete" />;
            }
            // return record.enterTime ? (
            //   <g-table-dot content="已进场" />
            // ) : (
            //   <g-table-dot content="待进场" status="audit" />
            // );
          },
        },
        {
          dataIndex: "payStatus",
          title: "支付状态",
          slots: {
            customRender: "payStatus",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (text === "WAIT_PAY") {
              return <g-table-dot content="待支付" status="audit" />;
            } else if (text === "PAY_SUCCESS") {
              return <g-table-dot content="已支付" />;
            } else if (text === "PAY_FAIL") {
              return <g-table-dot content="支付失败" status="delete" />;
            } else {
              // return <g-table-dot content="--" status="delete" />;
              return "--";
            }
          },
        },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
          width: 300,
        },
      ],
      search: [
        {
          label: "进场状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(approachStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        {
          label: "支付状态",
          value: "payStatus",
          component: "a-select",
          options: [
            { label: "全部", value: "" },
            { label: "其他", value: "NO_PAY" },
            { label: "待支付", value: "WAIT_PAY" },
            { label: "已支付", value: "PAY_SUCCESS" },
          ],
          placeholder: "请选择",
        },
        {
          label: "报备时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "报备号/报备人/来货车辆",
        },
      ],
      btns: ["detail"],
      modalVisible: false,
      modalForm: {
        reportId: "",
        measureUnit: "KG",
        weightType: "WEIGH_VALUE",
        weightValue: null,
        remark: "",
        liftRodReason: "",
        realFee: "",
        newFee: "",
        shouldFee: "",
      },
      rules: {
        measureUnit: [
          {
            required: true,
            message: "请选择计量单位",
            trigger: "change",
          },
        ],
        weightType: [
          {
            required: true,
            message: "请选择计量方式",
            trigger: "change",
          },
        ],
        liftRodReason: [
          {
            required: true,
            message: "请输入开闸原因",
          },
        ],
        remark: [
          {
            required: true,
            message: "请输入备注",
          },
        ],
        newFee: [
          {
            required: true,
            message: "请输入调整金额",
          },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的金额(最多两位小数)",
          },
        ],
        weightValue: [
          {
            required: true,
            message: "请输入重量",
            // trigger: "blur",
          },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的重量(最多两位小数)",
          },
        ],
        realFee: [
          {
            required: true,
            message: "",
            // trigger: "blur",
          },
          // {
          //   pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          //   message: "请输入正确的金额(最多两位小数)",
          // },
          {
            validator(rule, value) {
              const reg =
                /^((0{1}\.\d{1,2})|([1-9]\d*\.{1}\d{1,2})|([1-9]+\d*))$/;
              if (!value) {
                return Promise.reject("请输入实收金额");
              }
              if (reg.test(value)) {
                if (value > state.modalForm.shouldFee) {
                  return Promise.reject("实收金额应小于应收金额");
                } else {
                  return Promise.resolve();
                }
              } else {
                return Promise.reject("请输入正确的金额(最多两位小数)");
              }
            },
          },
        ],
      },
      modalType: "",
      modalTitle: "",
    });
    /*开闸*/
    const openTheGate = async (record) => {
      Modal.confirm({
        title: "手动开闸",
        content: "是否手动开闸？",
        okText: "确定",
        icon: createVNode(ExclamationCircleOutlined),
        cancelText: "取消",
        centered: true,
        onOk: async () => {
          await proxy.$api.openTheGate(record.id,"get" );
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        },
      });
    };

    const addReport = () => {
      history.pushState(
        { current: location.pathname + location.search }, '',
        `/portal/charge/approachReportDetail?type=add`
      )
    };

    /*点击设置重量*/
    const setWeight = (type, record) => {
      switch (type) {
        case "weight":
          state.modalTitle = "设置重量";
          state.modalVisible = true;
          break;
        case "open":
          state.modalTitle = "开闸";
          state.modalVisible = true;
          break;
        case "recieve":
          state.modalTitle = "收款";
          proxy.$api
            .reportModifyFee(record.id,"get" )
            .then((res) => {
              state.modalForm.shouldFee = typeof res === "boolean" ? "" : res;
              state.modalForm.realFee = typeof res === "boolean" ? "" : res;
              state.modalVisible = true;
            })
            .catch(() => {
              // state.modalForm.shouldFee = 12;
            });

          break;
        case "edit":
          state.modalTitle = "修改金额";
          proxy.$api.reportModifyFee(record.id,"get" ).then((res) => {
            state.modalForm.shouldFee = typeof res === "boolean" ? "" : res;
            state.modalVisible = true;
          });
          break;
      }
      state.modalType = type;
      state.modalForm.reportId = record.id;
    };

    /*保存重量设置*/
    const submitModal = () => {
      formRef.value.validate().then(async () => {
        switch (state.modalType) {
          case "weight": {
            //设置重量
            // if (state.modalForm.measureUnit === "T") {
            //   state.modalForm.weightValue = state.modalForm.weightValue * 1000;
            // }
            // let { liftRodReason, newFee, realFee, shouldFee, ...item } =
            //   state.modalForm;
            // proxy.$api.setWeightNew("post", item).then((res) => {
            //   proxy.$message.success("操作成功");
            //   tableRef.value.getData();
            // });
            proxy.$api
              .setWeightNew({
                // state.modalForm
                id: state.modalForm.reportId,
                newMeasureUnit: state.modalForm.measureUnit,
                newWeightType: state.modalForm.weightType,
                remark: state.modalForm.remark,
                newWeightValue: Number(state.modalForm.weightValue),
              },"post")
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
              });
            break;
          }
          case "open": //开闸
            proxy.$api
              .openTheGate({
                id: state.modalForm.reportId,
                liftRodReason: state.modalForm.liftRodReason,
              },"post")
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
              });

            break;
          case "recieve": // 收款
            proxy.$api
              .recieveFee({
                reportId: state.modalForm.reportId,
                realFee: Number(state.modalForm.realFee),
                remark: state.modalForm.remark,
              },"post")
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
              });
            break;
          case "edit": //修改金额
            proxy.$api
              .manualEditEnterFee({
                id: state.modalForm.reportId,
                newFee: Number(state.modalForm.newFee),
                remark: state.modalForm.remark,
              },"post")
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
              });
            break;
        }
        await cancel();
      });
    };

    const operation = (type, record) => {
      tableRef.value.searchRecord();
    };

    const cancel = async () => {
      state.modalForm.weightValue = "";
      state.modalForm.measureUnit = "KG";
      state.modalForm.weightType = "WEIGH_VALUE";
      state.modalForm.remark = "";
      await formRef.value.clearValidate();
      await formRef.value.resetFields();
      state.modalVisible = false;
    };
    return {
      tableRef,
      formRef,
      ...toRefs(state),
      millennial,
      openTheGate,
      submitModal,
      setWeight,
      operation,
      addReport,
      cancel,
    };
  },
});
</script>
<style lang="less" scoped></style>
