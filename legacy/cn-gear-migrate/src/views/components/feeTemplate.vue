<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="600px"
    title="选择费用模板"
    @cancel="close('cancel')"
    @ok="close('ok')"
  >
    <a-alert
      message="选择费用模板将替换原有编辑的所有费用项目，请谨慎使用。"
      type="warning"
    />
    <a-select
      ref="select"
      v-model:value="selectedRowKeys"
      style="margin-top: 10px; min-width: 200px"
      placeholder="请选择模板"
    >
      <a-select-option
        v-for="item in dataSource"
        :key="item.id"
        :value="item.id"
        >{{ item.name }}</a-select-option
      >
    </a-select>
  </a-modal>
</template>

<script lang='jsx'>
import {
  defineComponent,
  ref,
  toRefs,
  computed,
  unref,
  reactive,
  watch,
  getCurrentInstance,
} from "vue";
export default defineComponent({
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    activeId: {
      default: "",
      type: String,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      dataSource: [],
      selectedRowKeys: null,
      selected: null,
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    watch(modalVisible, (n) => {
      if (n) {
        getData();
        state.selectedRowKeys = null;
      }
    });
    const getData = () => {
      proxy.$api.getCostTmps().then((res) => {
        state.dataSource = res.records;
      });
    };

    const close = (data) => {
      if (data === "ok") {
        if (!state.selectedRowKeys) {
          proxy.$message.warn("请选择模板");
          return;
        }
        emit("close", state.selectedRowKeys);
      } else {
        emit("close");
      }
    };
    return {
      ...toRefs(state),
      modalVisible,
      close,
      getData,
    };
  },
});
</script>

<style lang="less" scoped>
.group-item {
  margin-bottom: 10px;
}
.group-name {
  margin-bottom: 5px;
  font-weight: 600;
}
</style>
