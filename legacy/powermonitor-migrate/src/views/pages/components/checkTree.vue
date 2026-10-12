<template>
  <a-tree
    v-if="treeData.length"
    :checkable="checkable"
    :show-icon="showIcon"
    :fieldNames="defaultProps"
    :tree-data="treeData"
    :defaultExpandAll="defaultExpandAll"
    v-model:checkedKeys="checkedKeys"
    @select="onSelect"
    @check="onCheck"
    checkStrictly
  >
    <template v-slot:title="nodeData">
      <div style="display: flex; justify-content: space-between; width: 300px">
        <div style="width: 90%">{{ nodeData[nameType] }}</div>
        <div style="width: 10%">
          {{ nodeData[numType] }}
        </div>
      </div>
    </template>
  </a-tree>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
export default defineComponent({
  props: {
    url: {
      type: String,
      default: "",
    },
    defaultProps: {
      type: Object,
      default: () => {
        return { children: "children", key: "id", labellabellabel: "name" };
      },
    },
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    params: {
      type: Object,
      default: null,
    },
    checkable: {
      type: Boolean,
      default: true,
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    customTreeData: {
      type: Boolean,
      default: false,
    },

    value: {
      type: [Number, String],
      default: "",
    },
    nameType: {
      type: [Number, String],
      default: "name",
    },
    numType: {
      type: [Number, String],
      default: "num",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      checkedKeys: [],
    });
    const treeData = ref([]);
    const getData = async () => {
      var treeDataCustom = [];
      if (props.url) {
        const data = await proxy.$api[proxy.url](proxy.params);
        if (data) {
          treeData.value = data;
        }

        if (data.statusListVos) {
          data.statusListVos.forEach(item => {
            if (item.name == "NORMAL") {
              treeDataCustom.push({
                title: "设备正常",
                name: item.name,
                num: item.num,
              });
            }
            if (item.name == "OFFLINE") {
              treeDataCustom.push({
                title: "设备离线",
                name: item.name,
                num: item.num,
              });
            }
            if (item.name == "TROUBLE") {
              treeDataCustom.push({
                title: "设备故障",
                name: item.name,
                num: item.num,
              });
            }
            if (item.name == "ALARM") {
              treeDataCustom.push({
                title: "设备报警",
                name: item.name,
                num: item.num,
              });
            }
          });

          treeData.value = treeDataCustom;
        }
      }
    };
    const onSelect = (selectedKeys, e) => {
      if (!e.selected) {
        state.checkedKeys = [];

        emit("update:value", null);
        emit("change", "");
      } else {
        state.checkedKeys = [e.node.eventKey];
        emit("update:value", state.checkedKeys[0]);
        emit("change", state.checkedKeys[0]);
      }
    };
    const onCheck = (checkedKeys, e) => {
      if (!e.checked) {
        state.checkedKeys = [];
        emit("update:value", null);
        emit("change", "");
      } else {
        state.checkedKeys = [e.node.eventKey];
        emit("update:value", state.checkedKeys[0]);
        emit("change", state.checkedKeys[0]);
      }
    };
    onMounted(() => {
      getData();
    });
    return {
      ...toRefs(state),
      onSelect,
      onCheck,
      treeData,
    };
  },
});
</script>

<style></style>
