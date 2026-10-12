<template lang="pug">
g-table(
  ref="tableRef"
  title="体验用户"
  :columns="columns"
  :api="api"
  :rowKey="'id'"
  :btns="btns"
  :scrollX="600"
  :search="search"
  :beforeSave="beforeSave"
  @slot="changeSwitch")         
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  toRaw,
  onMounted,
} from "vue";
import { tableColumns, timeFormat } from "@/utils/common";
import { enabled, gender } from "@/utils/enumerate";

export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          dataIndex: "sort",
          title: "序号",
          ellipsis: true,
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "fullName",
          title: "姓名",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "tel",
          title: "手机号",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enterpriseName",
          title: `企业名称`,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "体验时间",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
      ],
      btns: [],
      api: {
        list: "visitorStatistics",
        add: "userOperate",
        edit: "userOperate",
        detail: "record",
      },
      search: [
        {
          label: "体验时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        { label: "", value: "keyword", placeholder: "姓名" },
      ],
    });

    onMounted(function(){});

    const changeSwitch = async (slot, record) => {
      record.username = record.mobile;
      const item = _.cloneDeep(record);
      await proxy.$api.userOperate(`put`, toRaw(item));
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    const beforeSave = (record) => {
      Object.assign(record, { username: record.mobile });
      return record;
    };

    return {
      tableRef,
      ...toRefs(state),
      changeSwitch,
      beforeSave,
    };
  },
});
</script>
<style scoped lang="less">
@import url("@/styles/searchTable/index.less");
</style>
