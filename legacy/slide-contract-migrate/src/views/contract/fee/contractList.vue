<template lang="pug">
g-table(
  title="合同列表"
  editMode="page"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="['detail','add']"
)
  template(v-slot:btn='item')
     a-button(type="link" @click="details(item.record)" v-if="item.record.status !== 'STATUS_DRAFT'" :disabled="item.record.status !== 'STATUS_BE_OVERDUE'") 续签
     a-button(type="link" @click="details(item.record,'编辑')" v-if="item.record.status === 'STATUS_DRAFT'") 编辑
            
</template>
<script lang="jsx">
import { contractStatus } from "@/utils/enumerate";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import { timeFormat } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRouter();
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
        // {
        //   dataIndex: "signTime",
        //   key: "signTime",
        //   title: "签订日期",
        //   slots: {
        //     customRender: "signTime",
        //   },
        //   customRender: ({ text }) => {
        //     return timeFormat(text, false);
        //   },
        //
        // },
        {
          dataIndex: "status",
          key: "status",
          title: "合同状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "STATUS_DRAFT") {
              return <g-table-dot content="草稿" status="audit" />;
            } else if (text === "STATUS_BE_SIGNED") {
              return <g-table-dot content="待签定" status="audit" />;
            } else if (text === "STATUS_BE_EFFECTIVE") {
              return <g-table-dot content="待生效" status="audit" />;
            } else if (text === "STATUS_EFFECTIVE") {
              return <g-table-dot content="已生效" />;
            } else if (text === "STATUS_BE_OVERDUE") {
              return <g-table-dot content="过期" status="delete" />;
            } else if (text === "STATUS_STOP") {
              return <g-table-dot content="终止" status="delete" />;
            } else {
              return <g-table-dot content="作废" status="delete" />;
            }
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      search: [
        {
          label: "合同状态",
          placeholder: "请选择",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(contractStatus, {
            name: "label",
            value: "value",
          }),
        },
        { value: "keyword", placeholder: "合同编号/承租人" },
      ],
      api: {
        list: "getcontractLeases",
        path: "/contractDetail",
        pathParams: [{ value: "status" }],
      },
    });

    const details = (record, type) => {
      if (type === "编辑") {
        route.push({
          path: "/contractDetail",
          query: {
            id: record.id,
            type: "edit",
            status: record.status,
          },
        });
      } else {
        route.push({
          path: "/contractDetail",
          query: {
            id: record.id,
            type: "renewal",
          },
        });
      }
    };
    return {
      ...toRefs(state),
      details,
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
