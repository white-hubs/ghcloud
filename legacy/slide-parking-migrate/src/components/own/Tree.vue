<template lang="pug">
div.ctr(ref="ctr")
  div.flex.justif-between.searchCtr(v-if="treeSearch")
    a-input(v-model:value="modelValue" :placeholder="placeholder")
    a-button.ml2(type="primary" @click="getData") 查询
  a-tree(
    :size="size"
    :multiple="mode"
    :tree-data="treeData"
    :fieldNames="fieldNames"
    :auto-expand-parent="autoExpandParent"
    :expandedKeys="expandedKeys"
    v-model:selectedKeys="TreeSelectedKeys"
    @expand="onExpand"
    @select="select")
    //- template(v-if="titleSlots" #title="{ key: treeKey, title,  }")
    template(v-if="titleSlots" #title="{dataRef}")
      a-dropdown(:trigger="menuEvent")
        span {{dataRef[fieldNames.title]}}
        //- template(#overlay v-if="!dataRef[fieldNames.children] || dataRef[fieldNames.children].length === 0")
        template(#overlay v-if="dataRef[keyword] || !dataRef[fieldNames.children] || dataRef[fieldNames.children].length === 0")
          a-menu(@click="({key}) => menuClick(key,dataRef)" v-if="dataRef[keyword]")
            a-menu-item(v-for="item in menuList" :key="item.key") {{item.name}}
          a-menu(v-else @click="({key}) => menuClick(key,dataRef)")
            a-menu-item(v-for="item in menuSonList" :key="item.key") {{item.name}}
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  getCurrentInstance,
  toRefs,
  onMounted,
} from "vue";
import { flattenTree, treezen } from "@/utils/common";
export default defineComponent({
  props: {
    url: {
      type: String,
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    menuList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    menuSonList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    menuEvent: {
      type: Array,
      default: () => {
        return ["contextmenu"];
      },
    },
    method: {
      type: String,
      default: () => {
        return "get";
      },
    },
    keyword: {
      type: String,
    },
    key: {
      type: String,
    },
    params: {
      type: Object,
      default: () => {
        return null;
      },
    },
    fieldNames: {
      type: Object,
      default: () => {
        return {
          children: "children",
          label: "name",
          key: "id",
          value: "id",
        };
      },
    },
    placeholder: {
      type: String,
      default: () => {
        return "请选择";
      },
    },
    size: {
      type: String,
      default: () => {
        return "default";
      },
    },
    autoExpandParent: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    mode: {
      type: Boolean,
      default: false,
    },
    parentChecked: {
      type: Boolean,
      default: false,
    },
    treeSearch: {
      type: Boolean,
      default: false,
    },
    titleSlots: {
      type: Boolean,
      default: false,
    },
    isSelect: {
      type: Boolean,
      default: true,
    },
    lastLevel: {
      type: Boolean,
      default: true,
    },
    selectCondition: {
      type: String,
    },
  },
  // emits: ["getType"],
  setup(props, { emit }) {
    const modelValue = ref("");
    const expandedKeys = ref([]);
    const TreeSelectedKeys = ref([]);
    const { proxy } = getCurrentInstance();
    const state = reactive({
      treeData: [],
    });
    const addKey = async (value) => {
      // 先将数据拍平
      const data = flattenTree(value);
      data.forEach((item) => {
        if (props.isSelect) {
          // 当前树能否选中条件
          if (props.selectCondition) {
            if (item[props.selectCondition]) {
              Object.assign(item, { selectable: true });
            } else {
              Object.assign(item, { selectable: false });
            }
          } else if (props.lastLevel) {
            if (item?.children && item.children.length) {
              Object.assign(item, { selectable: false });
            } else {
              Object.assign(item, {
                selectable: true,
                children: [],
                parentId: item?.parentId ? item?.parentId : null,
              });
            }
          } else if (props.parentChecked) {
            Object.assign(item, { selectable: true });
          }
        } else {
          Object.assign(item, { selectable: false });
        }
      });
      const res = await treezen(data);
      return res;
    };

    const getData = async () => {
      if (props.url) {
        proxy.$api[props.url](props.params, props.method).then(async (res) => {
          if (res.records) {
            state.treeData = await addKey(res.records);
          } else {
            state.treeData = await addKey(res);
          }
        });
      } else {
        state.treeData = props.options;
      }
    };

    const onExpand = (keys) => {
      expandedKeys.value = keys;
    };

    const select = (selectedKeys, { selected, selectedNodes, node }) => {
      TreeSelectedKeys.value = selectedKeys;
      emit("get-click-node", selected, node);
      emit("get-all", TreeSelectedKeys.value, selected, selectedNodes, node);
      emit("get-all-node", selectedNodes);
      // 无法选中时获取当前点击
      emit("get-select", TreeSelectedKeys.value, selected, selectedNodes, node);
    };

    const menuClick = (key, record) => {
      emit("menu-click", key, record);
    };

    const changeSelected = (value) => {
      TreeSelectedKeys.value = value;
    };

    onMounted(() => {
      getData();
    });

    watch(
      () => props.value,
      (n) => {
        modelValue.value = n;
      }
    );

    return {
      modelValue,
      expandedKeys,
      TreeSelectedKeys,
      ...toRefs(state),
      changeSelected,
      menuClick,
      onExpand,
      getData,
      select,
    };
  },
});
</script>
<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
  .searchCtr {
    height: 46px;
    line-height: 1.5;
    align-items: center;
  }
}
:deep(.ant-tree) {
  width: 100%;
  height: calc(100% - 32px);
  overflow-y: auto;
  .ant-tree-node-content-wrapper {
    width: calc(100% - 24px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .ant-tree-title {
    width: 100%;
    display: inline-block;
    > .ant-dropdown-trigger {
      width: 100%;
      display: inline-block;
    }
  }
}
</style>
