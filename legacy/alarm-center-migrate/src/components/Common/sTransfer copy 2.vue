<template>
  <a-transfer
    ref="transferRef"
    class="tree-transfer"
    style="width: 100%"
    :render="(item) => item.title"
    :show-select-all="transferType === 'tree' ? true : false"
    :dataSource="transData"
    :targetKeys="targetKeys"
    :operations="operations"
    @change="onChange"
  >
    <template
      #children="{
        direction,
        filteredItems,
        selectedKeys,
        disabled: listDisabled,
        onItemSelectAll,
        onItemSelect,
      }"
    >
      <template v-if="transferType === 'tree'">
        <template v-if="direction === 'left'">
          <a-tree
            ref="leftTreeRef"
            blockNode
            checkable
            defaultExpandAll
            :checkedKeys="[...leftCheckedKeys, ...targetKeys]"
            :treeData="leftTreeData"
            @check="
              (_, props) => {
                onChecked(
                  _,
                  props,
                  [...selectedKeys, ...targetKeys],
                  onItemSelect
                );
              }
            "
            @click="
              (_, props) => {
                onChecked(
                  _,
                  props,
                  [...selectedKeys, ...targetKeys],
                  onItemSelect
                );
              }
            "
          ></a-tree>
        </template>
        <template v-if="direction === 'right'">
          <a-tree ref="rightTreeRef"></a-tree>
        </template>
      </template>
      <template v-if="transferType === 'table'">
        <a-table
          :row-selection="
            getRowSelection({
              disabled: listDisabled,
              selectedKeys,
              onItemSelectAll,
              onItemSelect,
            })
          "
          :columns="direction === 'left' ? api.leftCol : api.rightCol"
          :data-source="filteredItems"
          size="small"
          :rowKey="rowKey"
          :style="{ pointerEvents: listDisabled ? 'none' : null }"
        />
      </template>
    </template>
  </a-transfer>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  computed,
  toRefs,
  watch,
  unref,
  ref,
} from "vue";
import { LockOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import { flattenTree, checkBroData, treezen } from "@/utils/common";
import _ from "lodash";
export default defineComponent({
  props: {
    api: {
      type: Object,
      defalut: () => {
        return {
          list: "", //获取初始数据
          leftCol: [],
          rightCol: [],
        };
      },
    },
    leftApi: {
      type: Object,
      default: () => {
        return { list: "" };
      },
    },
    tableConfig: {
      type: Object,
      default: () => {
        return {
          scroll: null,
          size: "default",
        };
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    transferType: {
      type: String,
      default: "tree",
    },
    rowKey: {
      type: String,
      default: "id",
    },
    field: {
      type: Object,
    },
    // 穿梭按钮
    operations: {
      type: Array,
      default: () => {
        return ["", ""];
      },
    },
    // 穿梭框标题
    titles: {
      type: Array,
      default: () => {
        return ["", ""];
      },
    },
    // 已选keys集合
    selectedKeys: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 是否筛选
    showSearch: {
      type: Boolean,
      default: false,
    },
    //禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 分页
    showPage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // base
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    // ref
    const transferRef = ref();
    const leftTreeRef = ref();
    const leftTableRef = ref();
    const rightTreeRef = ref();
    const rightTableRef = ref();

    // data
    const leftCheckedKeys = ref([]);
    const state = reactive({
      transData: [], //transfer数据
      targetKeys: [], //选中数据
      leftTreeData: [],
      rightTreeData: [],
      leftTableData: [],
      rightTableData: [],
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: props?.tableConfig?.size,
      },
    });

    // 方法
    const getData = (obj) => {
      let params = {
        ...props.params,
        ...obj,
      };
      if (props.showPage) {
        Object.assign(params, { ...state.pagination });
      }
      proxy.$api[props.api.list](params, "get").then((res) => {
        if (props.transferType === "tree") {
        } else {
          state.leftTableData = res && res.records ? res.record : res;
          state.transData = res && res.records ? res.record : res;
        }
      });
    };

    const getRowSelection = ({
      disabled,
      selectedKeys,
      onItemSelectAll,
      onItemSelect,
    }) => {
      return {
        getCheckboxProps: (item) => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map((record) => record[props.rowKey]);
          const diffKeys = selected
            ? _.difference(treeSelectedKeys, selectedKeys)
            : _.difference(selectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },

        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    };

    const onChange = (nextTargetKeys) => {
      state.targetKeys = nextTargetKeys;
      // state.rightTableData = state.leftTableData.filter((item) =>
      //   nextTargetKeys.includes(item[props.rowKey])
      // );
    };

    onMounted(() => {
      getData();
    });

    // watch(
    //   () => leftTableRef.value?.selectedKeys,
    //   (n) => {
    //     n.forEach((element) => {
    //       transferRef.value.onLeftItemSelect(element, n.length ? true : false);
    //     });
    //   },
    //   { deep: true }
    // );

    return {
      transferRef,
      leftTreeRef,
      leftTableRef,
      rightTreeRef,
      rightTableRef,
      leftCheckedKeys,
      ...toRefs(state),
      getRowSelection,
      onChange,
    };
  },
});
</script>
<style lang="less" scoped></style>
