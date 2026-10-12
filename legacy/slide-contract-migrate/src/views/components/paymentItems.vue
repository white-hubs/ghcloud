<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="600px"
    title="选择收费项目"
    @cancel="close('cancel')"
    @ok="close('ok')"
  >
    <a-checkbox-group v-model:value="selectedRowKeys">
      <template v-for="item in dataSource" :key="item.id">
        <div
          class="group-item"
          v-if="item.children && item.children.length > 0"
        >
          <div class="group-name">{{ item.name }}</div>
          <div class="group-children">
            <a-checkbox :value="c.id" v-for="c in item.children" :key="c.id">{{
              c.name
            }}</a-checkbox>
          </div>
        </div>
        <div class="group-item" v-else>
          <div class="group-name">
            <a-checkbox :value="item.id" :key="item.id">{{
              item.name
            }}</a-checkbox>
          </div>
        </div>
      </template>
    </a-checkbox-group>
  </a-modal>
</template>

<script lang="jsx">
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
      default: () => [],
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      dataSource: [],
      selectedRowKeys: props.activeId,
      selected: null,
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    watch(modalVisible, (n) => {
      if (n) {
        getData();
      }
    });
    const getFilter = () => {
      state.selected = [];
      state.dataSource.forEach((item) => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((c) => {
            if (state.selectedRowKeys.indexOf(c.id) > -1) {
              state.selected.push(c);
            }
          });
        } else {
          if (state.selectedRowKeys.indexOf(item.id) > -1) {
            state.selected.push(item);
          }
        }
      });
    };
    const getData = () => {
      proxy.$api.getChargeProjects().then((res) => {
        state.dataSource = res;
        state.selectedRowKeys = props.activeId;
        getFilter();
      });
    };

    const close = (data) => {
      if (data === "ok") {
        getFilter();
        emit("close", state.selected);
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
