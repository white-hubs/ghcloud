<template lang="pug">
g-table(
  title="会员卡列表"
  editMode="page"
  ref="tableRef"
  :btns="['add']"
  :api="api"
  :search="search"
  :columns="columns"
)
  template(v-slot:btn="item")
    a-popconfirm(
      title="是否解绑？"
      cancelText="取消"
      okText="确定"
      @confirm.stop="unbind(item.record)")
        a(@click.stop="") 解绑
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import { orderStatus } from "@/utils/enumerate.js";
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import { useRouter } from "vue-router";
import { timeFormat } from "@/utils/common.js";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const tableRef = ref();
    const state = reactive({
      columns: [
        // 暂无
        {
          dataIndex: "code",
          key: "code",
          title: "会员卡号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "supplier.name",
          key: "name",
          title: "商家名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "supplier.liaison",
          key: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "supplier.phone",
          key: "phone",
          title: "联系人电话",
          slots: {
            customRender: "phone",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          key: "createTime",
          title: "绑卡时间",
          slots: {
            customRender: "createTime",
          },
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
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 65,
          fixed: "right",
        },
      ],
      api: {
        list: "memberCardList",
        path: "/bindCard",
      },
      search: [
        {
          label: "绑卡时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/会员卡号/联系人电话",
        },
        {
          label: "",
          value: "tenant",
          component: "span",
          defaultValue: JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))
            ?.code,
        },
      ],
    });

    const bank = (record) => {
      history.pushState({},'',`/portal/payAndSettle/bindCard`)

  
    };
    const unbind = (data) => {
      proxy.$api.unbind(data, "delete").then(() => {
        tableRef.value.getData();
        proxy.$message.success("操作成功");
      });
    };
    return {
      tableRef,
      ...toRefs(state),
      bank,
      unbind,
    };
  },
});
</script>
<style scoped lang="less">

.flex {
  justify-content: space-between;
  align-items: center;
}
</style>
