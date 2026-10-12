<template lang="pug">
.dataPanel-container
  a-spin(:spinning="spinning")
    .container-title
      gVerticalLine(title="数据概览")
    div.reportForm
      //- 交易数据汇总
      transactionDataSummary(v-if="data.indexOf('TRADE_SUMMARY')>-1")
      //- 白条交易量
      whiteNoteTransaction(v-if="data.indexOf('PORK_TRADE_CAPACITY')>-1")
      //- 白条交易均价
      whiteNoteAverage(v-if="data.indexOf('PORK_TRADE_AVERAGE')>-1")
      //- 白条供货量
      supplyQuantity(v-if="data.indexOf('PORK_SUPPLY_CAPACITY')>-1")
      //- 食安信息
      foodSafety(v-if="data.indexOf('PORK_SPOT_CHECK')>-1")
      div.column-3
        //- 理货数据审核
        tallyData(v-if="data.indexOf('PORK_ARRANGE_AUDIT')>-1")
        //- 来货报备
        incomingGoods(v-if="data.indexOf('PORK_REPORT')>-1")
        //- 报备商家
        reportingMerchant(v-if="data.indexOf('PORK_RISK_LEVEL')>-1")
      div.column-2
        //- 供货商交易排名
        supplierRanking(v-if="data.indexOf('PORK_SUPPLY_TRADE_RANK')>-1")
        //- 白条出厂情况
        whiteNoteOut(v-if="data.indexOf('PORK_ABATTOIR')>-1")
      //- 理货商品明细
      tallyCommodity(v-if="data.indexOf('PORK_ARRANGE_DETAIL')>-1")
</template>
<script lang="jsx">
import {
  defineComponent,
  inject,
  reactive,
  toRefs,
  getCurrentInstance,
  watch,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import transactionDataSummary from "./components/transactionDataSummary.vue";
import whiteNoteTransaction from "./components/whiteNoteTransaction.vue";
import whiteNoteAverage from "./components/whiteNoteAverage.vue";
import supplyQuantity from "./components/supplyQuantity.vue";
import foodSafety from "./components/foodSafety.vue";
import tallyData from "./components/tallyData.vue";
import incomingGoods from "./components/incomingGoods.vue";
import reportingMerchant from "./components/reportingMerchant.vue";
import supplierRanking from "./components/supplierRanking.vue";
import whiteNoteOut from "./components/whiteNoteOut.vue";
import tallyCommodity from "./components/tallyCommodity.vue";
export default defineComponent({
  components: {
    transactionDataSummary,
    whiteNoteTransaction,
    whiteNoteAverage,
    supplyQuantity,
    foodSafety,
    tallyData,
    incomingGoods,
    reportingMerchant,
    supplierRanking,
    whiteNoteOut,
    tallyCommodity,
  },
  setup() {
    const store = useStore();
    const state = reactive({
      data: [],
      spinning: true,
    });
    const { proxy } = getCurrentInstance();
    onMounted(() => {
      const roleIds = JSON.parse(sessionStorage.getItem('GH-UserInfo')).roles.map(
        (item) => item.id
      );
      proxy.$api
        .getStatRolePanelRoles({ roleIds: roleIds.join(',') },"get" )
        .then((res) => {
          state.data = res.panelTypes;
          state.spinning = false;
        });
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>
<style lang="less" scoped>
.dataPanel-container {
  width: 100%;
  height: 100%;
  // overflow-y: scroll;
  // overflow-y: overlay;
  .reportForm {
    width: 100%;
    height: calc(100% - 50px);
    overflow-y: scroll;
    overflow-y: overlay;
    &::-webkit-scrollbar {
      width: 0.16rem;
      background: rgba(146, 146, 146, 0.2);
      // box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
      border-radius: 0.08rem;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(177, 177, 177);
      // box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
    }
    /*滚动条的上下两端的按钮*/
    &::-webkit-scrollbar-button {
      height: 0px;
    }
  }
  .container-title {
    height: 50px;
    background: #ffffff;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 16px;
    .title-left {
      width: 295px;
      height: 100%;
      background-image: url("/resource/v1/slide-meatslider-migrate/images/title-left.png");
      background-repeat: no-repeat;
      background-size: cover;
    }
    .title-center {
      flex: 1;
      height: 100%;
      background-image: url("../../../assets/images/title-center.png");
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      font-size: 26px;
      font-family: PingFang SC-Medium;
      font-weight: 500;
      color: #000000;
      line-height: 120px;
    }
    .title-right {
      width: 284px;
      height: 100%;
      background-image: url("/resource/v1/slide-meatslider-migrate/images/title-right.png");
      background-repeat: no-repeat;
      background-size: cover;
    }
  }
  .column-3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      width: calc(33.33% - 16px);
    }
  }
  .column-2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      width: calc(50% - 12px);
    }
  }
}
</style>
