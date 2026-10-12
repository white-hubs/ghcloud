<template lang="pug">
//- g-layout()
  template(#content-table)
g-table(
  title="访问端列表"
  :columns="columns"
  :api="api"
  :slots="slots"
  editMode="page"
  :btns="['add','edit','deleteSingle','detail']"
  @slot="editTerminal"
  ref="tableRef"
)
</template>
<script lang='jsx'>
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import { tableColumns } from "@/utils/common";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();

    const state = reactive({
      api: {
        list: "getTerminals",
        path: "/addTerminal",
        deleteSingle: "terminalId",
      },
      columns: null,
      columnsList: ["name", "code", "path", "enabled", "remark", "action"],
      slots: [{ slot: "enabled", component: "a-switch" }],
    });

    const editTerminal = async (slot, record) => {
      await proxy.$api.terminalId("put", record);
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    onMounted(() => {
      state.columns = tableColumns("terminalList", state.columnsList);
    });
    return {
      tableRef,
      ...toRefs(state),
      editTerminal,
    };
  },
});
</script>
