<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="入场补录记录"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :search="search")
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
        span IC卡：{{choseRecord?.realFeeTotal || choseRecord?.realFeeTotal === 0 ? millennial(choseRecord?.realFeeTotal,true) : '--'}}
        span 微信：{{choseRecord?.wechatAmountTotal || choseRecord?.wechatAmountTotal === 0 ? millennial(choseRecord?.wechatAmountTotal,true) : '--'}}
        //- span 支付宝：{{choseRecord?.alipayAmountTotal || choseRecord?.alipayAmountTotal === 0 ? millennial(choseRecord?.alipayAmountTotal,true) : '--'}}
        span 免费：{{choseRecord?.discountFeeTotal || choseRecord?.discountFeeTotal === 0 ? millennial(choseRecord?.discountFeeTotal,true) : '--'}}

</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
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
          dataIndex: "plateNo",
          title: "入场补录车牌",
          slots: {
            customRender: "plateNo",
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
          dataIndex: "entryTime",
          title: "入场补录时间",
          slots: {
            customRender: "entryTime",
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
          dataIndex: "entryLaneName",
          title: "入场补录车道",
          slots: {
            customRender: "entryLaneName",
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
          dataIndex: "entryAreaName",
          title: "入场补录区域",
          slots: {
            customRender: "entryAreaName",
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
          dataIndex: "entryOperatorName",
          title: "入场补录操作员",
          slots: {
            customRender: "entryOperatorName",
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
      ],
      api: {
        list: "enterRepair",
      },
      btns: [],
      search: [
        {
          label: "入场补录时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车牌号/操作员",
        },
      ],
      visible: false,
      choseRecord: null,
    });

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
    };
  },
});
</script>

<style lang="less" scoped>
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
