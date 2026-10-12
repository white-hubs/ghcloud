<template lang="pug">
//- g-layout()
  template(#content-table)
g-table(
  title="菜单列表"
  :columns="columns"
  :api="api"
  :search="search"
  :slots="slots"
  editMode="page")
</template>
<script lang='jsx'>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { tableColumns } from "@/utils/common";
import replaceObjectKeys from "@pansy/replace-object-keys";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      api: {
        list: "getMenu",
        path: "/addAppMenu",
        deleteSingle: "menuId",
      },
      columns: null,
      columnsList: ["name", "code", "path", "enabled", "remark", "action"],
      slots: [{ slot: "enabled", component: "a-switch" }],
      btns: ["edit", "add", "detail", "deleteSingle"],
      search: [
        {
          label: "所属访问端",
          value: "terminalId",
          component: "a-select",
          options: null,
          defaultValue: null,
        },
      ],
    });

    const getTerminal = async () => {
      const data = await proxy.$api.getTerminals("get");
      if (data && data.records) {
        state.search[0].options = replaceObjectKeys(data.records, {
          name: "label",
          id: "value",
        });
      } else {
        state.search[0].options = replaceObjectKeys(data, {
          label: "name",
          value: "id",
        });
      }
      state.search[0].defaultValue = state.search[0].options[0].value;
    };

    onMounted(() => {
      state.columns = tableColumns("menuList", state.columnsList);
      getTerminal();
    });
    return {
      ...toRefs(state),
      getTerminal,
    };
  },
});
</script>
