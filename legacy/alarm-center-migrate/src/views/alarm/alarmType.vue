<template lang="pug">
g-table(
  title="报警类型"
  :columns="columns"
  :api="api"
  :search="search"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :beforeSave="beforeSave"

)
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
} from "vue";

export default defineComponent({
  setup(props) {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      list: [],
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "类型名称",
          slots: {
            customRender: "name",
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
        list: "getSatAlarmTypes",
        deleteSingle: "deleteSatAlarmType",
        add: "postSatAlarmType",
        edit: "putSatAlarmType",
        detail: "getSatAlarmType",
        path: null, //详情页面路由
      },
      search: [
        {
          value: "keyword",
          placeholder: "类型名称",
        },
      ],
      btns: ["add", "edit", "deleteSingle"],
      modal: [
        { label: "类型名称", value: "name" },
        // {
        //   label: "访问端",
        //   value: "terminals",
        //   component: "g-select",
        //   url: "getContextTerminals",
        //   mode: "multiple",
        //   field: {
        //     code: "value",
        //     name: "label",
        //   },
        // },
      ],
      rules: {
        name: [{ required: true, message: "请输入类型名称" }],
      },
    });
    const getData = async () => {
      state.list = await proxy.$api.getContextTerminals();
    };
    onMounted(() => {
      getData();
    });
    const beforeSave = (form) => {
      let terminals = []
      state.list.forEach((item) => {
           terminals.push({
              terminal: item.code,
              terminalName: item.name,
            })
        });
      
      const res = { ...form, terminals };
      return res;
    };
    return {
      ...toRefs(state),
      beforeSave,
    };
  },
});
</script>
