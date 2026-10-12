<template>
  <a-transfer
    ref="transferRef"
    class="tree-transfer"
    style="width: 100%"
    :render="(item) => item.title"
    :dataSource="transData"
    :targetKeys="targetKeys"
    :operations="operations"
    @change="onChange"
    @selectChange="selectChange"
  >
    <template #children="{ direction, selectedKeys, onItemSelect }">
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
        <template v-if="direction === 'left'">
          <!-- <s-table
            class="pt2 pb1"
            ref="leftTableRef"
            :api="leftApi"
            :columns="api.leftCol"
            :size="tableConfig.size"
            :showPage="showPage"
            :btns="[]"
            :allowSelect="true"
            :scrollX="100"
          ></s-table> -->
          <a-table
            ref="leftTableRef"
            :dataSource="leftTableData"
            :columns="api.leftCol"
            :rowKey="rowKey"
            :rowSelection="rowLeftSelection"
            :scroll="tableConfig.scroll"
            :size="tableConfig.size"
          ></a-table>
        </template>
        <template v-if="direction === 'right'">
          <a-table
            ref="rightTableRef"
            :dataSource="rightTableData"
            :columns="api.rightCol"
            :rowKey="rowKey"
            :rowSelection="rowRightSelection"
            :scroll="tableConfig.scroll"
            :size="tableConfig.size"
          ></a-table>
        </template>
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
        return [">", "<"];
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
        }
      });
    };

    const rowLeftSelection = computed(() => {
      return {
        selectedRowKeys: unref(leftCheckedKeys.value),
        getCheckboxProps: (record) => {
          return {
            disabled: state.targetKeys.includes(record[props.rowKey])
              ? true
              : false,
          };
        },
        onChange: (record) => {
          leftCheckedKeys.value = record;
        },
      };
    });

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
      rowLeftSelection,
    };
  },
});
</script>
<style lang="less" scoped></style>
