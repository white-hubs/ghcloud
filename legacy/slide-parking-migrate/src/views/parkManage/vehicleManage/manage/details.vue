<template lang="pug">
g-layout(
  :title="`车辆${type === 'add' ? '购卡' :(type === 'detail' ? '详情':'延期')}`")
  template(#content-table)
    g-detail-form(
      :api="api"
      :formList="formList")
      template(v-slot:edit-item="{record}")
        .item-title 购卡信息
        a-table(
          :columns="columns"
          :dataSource="tableData"
          :rowKey="'id'"
          :pagination="false"
          size="small"
        )
  template(#footer-page)
    a-button(@click="goBack") 返回
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { millennial, timeFormat, dateAdd } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const form = ref();
    const type = route.query.type;
    const carId = route.query.id;

    const state = reactive({
      columns: [
        {
          dataIndex: "sort",
          title: "序号",
          slots: { customRender: "sort" },
          ellipsis: true,
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "cardName",
          title: "车卡类型",
          slots: { customRender: "cardName" },
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
          dataIndex: "createTime",
          title: "购卡时间",
          slots: { customRender: "createTime" },
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
          dataIndex: "payAmount",
          title: "收费金额",
          slots: { customRender: "payAmount" },
          ellipsis: true,
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  text || text === 0
                    ? `￥${millennial(text, true)}${
                        record.addAmount
                          ? "(补缴:" + millennial(record.addAmount, true) + ")"
                          : ""
                      }`
                    : "--"
                }
              >
                {text || text === 0
                  ? `￥${millennial(text, true)}${
                      record.addAmount
                        ? "(补缴:" + millennial(record.addAmount, true) + ")"
                        : ""
                    }`
                  : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payStatus",
          title: "支付状态",
          slots: { customRender: "payStatus" },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "UNPAID":
                res = "待支付";
                break;
              case "PAID":
                res = "已支付";
                break;
              default:
                res = "";
                break;
            }
            return (
              <PopOver position="topLeft" content={res}>
                {res ? res : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        detail:
          route.query.url === "businessKey"
            ? "getParkingCardPurchaseDeplay"
            : "vehicleId",
      },
      formList: [
        {
          title: "车辆信息",
          form: [
            { label: "车牌号", value: "plateNo" },
            { label: "车辆类型", value: "carTypeName" },
            { label: "车主姓名", value: "carOwnerName" },
            { label: "电话号码", value: "phone" },
          ],
        },
      ],
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        current: 1,
        total: 0,
        size: "small",
      },
      tableData: [],
    });

    const goBack = () => {
      history.back()
    };

    const getTable = () => {
      if (route.query.url === "businessKey") {
        proxy.$api.getParkingCardDeplay(carId, "get").then((res) => {
          if (res && res.records) {
            state.tableData = res.records;
            state.pagination.total = res.total;
          } else {
            state.tableData = res;
          }
        });
      } else {
        proxy.$api.vehicleIdCard(carId,"get" ).then((res) => {
          if (res && res.records) {
            state.tableData = res.records;
            state.pagination.total = res.total;
          } else {
            state.tableData = res;
          }
        });
      }
    };
    onMounted(() => {
      getTable();
    });

    return {
      ...toRefs(state),
      goBack,
      type,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.hide {
  display: none;
}
</style>
