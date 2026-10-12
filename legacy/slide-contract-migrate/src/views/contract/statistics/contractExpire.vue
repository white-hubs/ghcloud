<template lang="pug">
g-table(
  title="合同到期"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="btns"
)
</template>
<script lang="jsx">
import { contractStatus } from "@/utils/enumerate";
import { defineComponent, reactive, toRefs } from "vue";
import { timeFormat } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "code",
          key: "code",
          title: "合同编号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "signType",
          key: "signType",
          title: "签约方式",
          slots: {
            customRender: "signType",
          },
          customRender: ({ text }) => {
            if (text === "SIGNATURE_NEW") {
              return (
                <PopOver position="topLeft" content="新签">
                  新签
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="续签">
                  续签
                </PopOver>
              );
            }
          },
        },
        {
          dataIndex: "merchantLiaison",
          key: "merchantLiaison",
          title: "承租人",
          slots: {
            customRender: "merchantLiaison",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "leaseModeName",
          key: "leaseModeName",
          title: "承租方式",
          slots: {
            customRender: "leaseModeName",
          },
          customRender: ({ text }) => {
            if (text === "RENT_TEMPORARY") {
              return (
                <PopOver position="topLeft" content="临租">
                  临租
                </PopOver>
              );
            } else if (text === "RENT_TEMPORARY") {
              return (
                <PopOver position="topLeft" content="短租">
                  短租
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="长租">
                  长租
                </PopOver>
              );
            }
          },
        },
        {
          dataIndex: "leaseTerm",
          key: "leaseTerm",
          title: "租赁期限",
          slots: {
            customRender: "leaseTerm",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  timeFormat(record.leaseStartTime, false) +
                  "~" +
                  timeFormat(record.leaseEndTime, false)
                }
              >
                {timeFormat(record.leaseStartTime, false) +
                  "~" +
                  timeFormat(record.leaseEndTime, false)}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "signTime",
          key: "signTime",
          title: "签订日期",
          slots: {
            customRender: "signTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={timeFormat(text, false)}>
                {timeFormat(text, false)}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          key: "status",
          title: "合同状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            let str = "";
            if (text === "STATUS_DRAFT") {
              str = "草稿";
            } else if (text === "STATUS_BE_SIGNED") {
              str = "待签定";
            } else if (text === "STATUS_BE_EFFECTIVE") {
              str = "待生效";
            } else if (text === "STATUS_EFFECTIVE") {
              str = "已生效";
            } else if (text === "STATUS_BE_OVERDUE") {
              str = "过期";
            } else if (text === "STATUS_STOP") {
              str = "终止";
            } else {
              str = "作废";
            }
            return (
              <PopOver position="topLeft" content={str}>
                {str}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "overdueDays",
          key: "overdueDays",
          title: "到期剩余时间（天）",
          slots: {
            customRender: "overdueDays",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [
        {
          label: "租赁日期",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "合同状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(contractStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
      ],
      api: {
        list: "getContractLeasesStatistics",
      },
      btns: [],
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.buttonGroup {
  button {
    margin-left: 10px;
  }
}

</style>
