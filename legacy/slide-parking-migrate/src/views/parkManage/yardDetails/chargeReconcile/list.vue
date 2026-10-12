<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="收费对账"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :beforeGet="beforeGet"
    :search="search")
    template(v-slot:btn="{record}")
      a-button(type="link" @click="goPage('delay',record)") 明细
      a-button(type="link" @click="openModal(record)") 对账
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
  a-modal(
    v-model:visible="visible" 
    centered 
    :title="'对账信息'" 
    @ok="save" 
    @cancel="cencel")
      div.modalGrid
        span.title 实收金额：{{choseRecord?.realFeeTotal || choseRecord?.realFeeTotal === 0 ? millennial(choseRecord?.realFeeTotal,true) : '--'}}
        span.title 应收金额：{{choseRecord?.parkingFeeTotal || choseRecord?.parkingFeeTotal === 0 ? millennial(choseRecord?.parkingFeeTotal,true) : '--'}}
        span 现金：{{choseRecord?.cashAmountTotal || choseRecord?.cashAmountTotal === 0 ? millennial(choseRecord?.cashAmountTotal,true) : '--'}}
        span 余额：{{choseRecord?.cardAmountTotal || choseRecord?.cardAmountTotal === 0 ? millennial(choseRecord?.cardAmountTotal,true) : '--'}}
        span 微信：{{choseRecord?.wechatAmountTotal || choseRecord?.wechatAmountTotal === 0 ? millennial(choseRecord?.wechatAmountTotal,true) : '--'}}
        //- span 支付宝：{{choseRecord?.alipayAmountTotal || choseRecord?.alipayAmountTotal === 0 ? millennial(choseRecord?.alipayAmountTotal,true) : '--'}}
        span 免费：{{choseRecord?.discountFeeTotal || choseRecord?.discountFeeTotal === 0 ? millennial(choseRecord?.discountFeeTotal,true) : '--'}}

</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();
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
          title: "日期",
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
          defaultValue: false,
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
          label: "交班时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "收费人",
        },
      ],
      visible: false,
      choseRecord: null,
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

    const goPage = (value, record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
         `/portal/park/reconcile?type=${value}&id=${record?.id}&startTime=${timeFormat(record.staStartTime, true)}&endTime=${timeFormat(record.staEndTime, true)}
         &laneCode=${record.laneCode}&operateId=${record.userId}`
      )
    };

    const openModal = (record) => {
      state.choseRecord = record;
      state.visible = true;
    };

    const cancel = () => {
      state.choseRecord = null;
      state.visible = false;
    };

    const save = () => {
      proxy.$api.ReconcilieRecordAdd(state.choseRecord?.id,"put" ).then(() => {
        proxy.$message.success("操作成功");
        cancel();
        tableRef.value.getData();
      });
    };

    const beforeGet = (params) => {
      const { status, period, keyword, laneIds } = params;
      getSta(status, period, keyword, laneIds);
      return params;
    };

    const getSta = (status, period, keyword, laneIds) => {
      proxy.$api.chargeSta({ period, status: status },"get" ).then((res) => {
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

    onMounted(function(){});

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
      openModal,
      beforeGet,
      goPage,
      cancel,
      save,
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
.modalGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  span {
    display: inline-block;
    height: 32px;
    line-height: 1.5;
    &.title {
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
