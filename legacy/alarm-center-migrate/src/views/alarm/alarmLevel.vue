<template lang="pug">
g-table(
  title="报警级别"
  :columns="columns"
  :api="api"
  :search="search"
  :btns="btns"
  :modal="modal"
  :rules="rules"
)
</template>
<script lang="jsx">
import { defineComponent, reactive, toRefs } from "vue";

export default defineComponent({
  setup(props) {
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "级别名称",
          slots: {
            customRender: "name",
          },
          // width: 650,
        },
        {
          dataIndex: "sort",
          key: "sort",
          title: "报警优先级",
          slots: {
            customRender: "sort",
          },
          // width: 650,
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
      api: {
        list: "getSatAlarmLevels",
        deleteSingle: "deleteSatAlarmLevel",
        add: "postSatAlarmLevel",
        edit: "putSatAlarmLevel",
        detail: "record",
        path: null, //详情页面路由
      },
      search: [
        {
          value: "keyword",
          placeholder: "级别名称",
        },
      ],
      btns: ["add", "edit", "deleteSingle"],
      modal: [
        { label: "级别名称", value: "name" },
        {
          label: "报警优先级",
          value: "sort",
          component: "g-select",
          placeholder: "请选择,数字越大优先级越高",
          options: [
            { value: 1, label: 1 },
            { value: 2, label: 2 },
            { value: 3, label: 3 },
            { value: 4, label: 4 },
            { value: 5, label: 5 },
            { value: 6, label: 6 },
            { value: 7, label: 7 },
            { value: 8, label: 8 },
            { value: 9, label: 9 },
          ],
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入级别名称" }],
        sort: [{ required: true, message: "请选择报警优先级" }],
      },
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>
