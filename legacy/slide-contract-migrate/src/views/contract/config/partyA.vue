<template lang="pug">
g-table(
  title="甲方信息"
  editMode="page"
  :columns="columns"
  :search="search"
  :api="api"
  :slots="slots"
  @slot="onToggle"
  ref="tableRef"
)     
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";

import { timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "甲方名称",
          slots: {
            customRender: "name",
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
          dataIndex: "liaison",
          key: "liaison",
          title: "联系人",
          slots: {
            customRender: "liaison",
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
          dataIndex: "phone",
          key: "phone",
          title: "联系人手机",
          slots: {
            customRender: "phone",
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
          dataIndex: "signatoryCount",
          key: "signatoryCount",
          title: "签约人数",
          slots: {
            customRender: "signatoryCount",
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
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          dataIndex: "updateTime",
          key: "updateTime",
          title: "添加时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={timeFormat(text, true)}>
                  {timeFormat(text, true)}
                </PopOver>
              );
            } else {
              return "--";
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
          label: "启用状态",
          value: "enabled",
          component: "a-select",
          options: [
            { label: "禁用", value: false },
            { label: "启用", value: true },
          ],
          placeholder: "请选择",
        },
        { label: "", value: "keyword", placeholder: "甲方名称/联系人" },
      ],
      api: {
        list: "getPartys",
        path: "/partyDetail",
        deleteSingle: "deleteParty",
      },
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
    });
    // 切换状态
    const onToggle = (slot, record) => {
      proxy.$api.putPartyStatus( record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    return {
      tableRef,
      ...toRefs(state),
      onToggle,
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
