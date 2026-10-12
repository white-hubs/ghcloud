<template lang="pug">
g-table(
  ref="tableRef"
  title="对账记录"
  :editMode="'page'"
  :columns="columns"
  :btns="btns"
  :api="api"
  :beforeGet="beforeGet"
  :search="search")
  template(v-slot:btn="{record}")
    a-button(type="link" @click="cancel(record)") 撤销
  template(#statistic-data)    
      div.gridTop.mb2
        div.flex.justify-around
          a-statistic(title="实收总金额（元）" :value="statistic.realFeeTotal" :precision="2" :prefix="'￥'")
        div.borderRight
        div.flex.justify-around
          a-statistic(title="应收总金额（元）" :value="statistic.parkingFeeTotal" :precision="2" :prefix="'￥'")
        div.borderRight
        div.flex.justify-around  
          a-statistic(title="现金支付（元）" :value="statistic.cashAmountTotal" :precision="2" :prefix="'￥'")
        div.borderRight
        div.flex.justify-around  
          a-statistic(title="余额支付（元）" :value="statistic.cardAmountTotal" :precision="2" :prefix="'￥'")
        div.borderRight
        div.flex.justify-around  
          a-statistic(title="微信支付（元）" :value="statistic.wechatAmountTotal" :precision="2" :prefix="'￥'")
        div.borderRight
        //- div.flex.justify-around  
          a-statistic(title="支付宝（元）" :value="statistic.alipayAmountTotal" :precision="2" :prefix="'￥'")
          div.borderRight
        div.flex.justify-around  
          a-statistic(title="免费金额（元）" :value="statistic.discountFeeTotal" :precision="2" :prefix="'￥'")
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { useStore } from "vuex";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          dataIndex: "laneName",
          title: "收费车道",
          slots: {
            customRender: "laneName",
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
          dataIndex: "areaName",
          title: "收费区域",
          slots: {
            customRender: "areaName",
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
          dataIndex: "endTime",
          title: "换班时间",
          slots: {
            customRender: "endTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text) : ""}
              >
                {text ? timeFormat(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "userName",
          title: "收费人姓名",
          slots: {
            customRender: "userName",
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
          dataIndex: "cashAmountTotal",
          title: "现金支付",
          slots: {
            customRender: "cashAmountTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "walletAmountTotal",
          title: "余额支付",
          slots: {
            customRender: "walletAmountTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "wechatAmountTotal",
          title: "微信支付",
          slots: {
            customRender: "wechatAmountTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "discountFeeTotal",
          title: "免费金额",
          slots: {
            customRender: "discountFeeTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "parkingFeeTotal",
          title: "应收总金额",
          slots: {
            customRender: "parkingFeeTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "realFeeTotal",
          title: "实收总金额",
          slots: {
            customRender: "realFeeTotal",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operateTime",
          title: "对账时间",
          slots: {
            customRender: "operateTime",
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
          dataIndex: "operator",
          title: "对账人员",
          slots: {
            customRender: "operator",
          },
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 160,
        },
      ],
      api: {
        list: "ReconcilieRecord",
      },
      btns: [],
      search: [
        {
          label: "",
          value: "status",
          component: "span",
          defaultValue: true,
        },
        {
          label: "车道",
          value: "laneIds",
          component: "gCascader",
          url: "laneTreeNoEquip",
          placeholder: "请选择车道",
          params: {
            tenant: getNowEnterprise().code,
          },
        },
        {
          label: "对账时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "operatePeriod",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "收费人/区域/对账人",
        },
      ],
      statistic: {
        alipayAmountTotal: 0,
        cardAmountTotal: 0,
        cashAmountTotal: 0,
        discountFeeTotal: 0,
        parkingFeeTotal: 0,
        realFeeTotal: 0,
        wechatAmountTotal: 0,
      },
    });

    const tableRef = ref();
    const goPage = (value, record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
         `/portal/park/reconcile?type=${value}&id=${record?.id}`
      )
    };

    const cancel = (record) => {
      Modal.confirm({
        title: () => "撤销确认",
        icon: () => createVNode(ExclamationCircleOutlined),
        content: () => "是否撤销当前对账信息?",
        okText: () => "确认",
        okType: "danger",
        centered: true,
        cancelText: () => "取消",
        onOk() {
          // 删除设备
          proxy.$api.ReconcilieCancel( record.id,"put").then(() => {
            proxy.$message.success("操作成功");
            tableRef.value.getData();
          });
        },
      });
    };

    const getSta = (period, keyword, laneIds) => {
      proxy.$api
        .chargeSta({
          period,
          status: true,
          keyword,
          laneIds,
        },"get" )
        .then((res) => {
          state.statistic =
            typeof res === "object"
              ? res
              : {
                  alipayAmountTotal: 0,
                  cardAmountTotal: 0,
                  cashAmountTotal: 0,
                  discountFeeTotal: 0,
                  parkingFeeTotal: 0,
                  realFeeTotal: 0,
                  wechatAmountTotal: 0,
                };
        });
    };

    const beforeGet = (params) => {
      const { keyword, operatePeriod, laneIds } = params;
      getSta(operatePeriod, keyword, laneIds);
      return params;
    };

    onMounted(() => {
      // getSta();
    });

    // watch(
    //   () => tableRef.value?.form.period,
    //   () => {
    //     getSta();
    //   }
    // );

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
      beforeGet,
      goPage,
      cancel,
    };
  },
});
</script>

<style lang="less" scoped>
.gridTop {
  width: 100%;
  height: 130px;
  display: flex;
  justify-content: space-around;
  // display: grid;
  // grid-template-columns: repeat(7, 1fr);
  align-items: center;
  background-color: #fbfbfb;
  .flex {
    align-items: center;
  }
  .borderRight {
    width: 2px;
    height: 30px;
    border-right: 1px dashed #999999;
  }
}
:deep(.ant-statistic) {
  text-align: left;
  padding-left: 16px;
  .ant-statistic-content-value-int {
    font-weight: bold;
    font-size: 24px;
  }
  .ant-statistic-content-value-decimal {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
