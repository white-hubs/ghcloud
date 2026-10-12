<template>
  <div>
    <a-spin :spinning="spinning">
      <a-transfer
        :data-source="transferType === 'table' ? transData : baseData"
        :target-keys="targetKeys"
        :disabled="disabled"
        :show-search="showSearch"
        :render="(item) => item.title"
        :filter-option="
          (inputValue, item) => item.title.indexOf(inputValue) !== -1
        "
        :show-select-all="false"
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
              :columns="direction === 'left' ? config.leftCol : config.rightCol"
              :data-source="filteredItems"
              :rowKey="'key'"
              size="small"
              :style="{ pointerEvents: listDisabled ? 'none' : null }"
            />
          </template>
          <template v-else-if="transferType === 'tree'">
            <template v-if="direction === 'left'">
              <a-tree
                :treeData="transData"
                checkable
                blockNode
                defaultExpandAll
                :selectable="false"
                :checkedKeys="[...treeSelectKeys, ...targetKeys]"
                :fieldNames="field"
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
                @select="
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
            <template v-else>
              <a-tree
                :treeData="rightTreeData"
                checkable
                blockNode
                defaultExpandAll
                :selectable="false"
                :checkedKeys="rightSelectKeys"
                :fieldNames="field"
                @check="
                  (_, props) => {
                    onRightChecked(
                      _,
                      props,
                      [...selectedKeys, ...targetKeys],
                      onItemSelect
                    );
                  }
                "
                @select="
                  (_, props) => {
                    onRightChecked(
                      _,
                      props,
                      [...selectedKeys, ...targetKeys],
                      onItemSelect
                    );
                  }
                "
              ></a-tree>
            </template>
          </template>
        </template>
      </a-transfer>
    </a-spin>
  </div>
</template>
<script lang="jsx">
import _ from "lodash";
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
import { flattenTree, treezenFiltered, treezen } from "@/utils/common";
export default defineComponent({
  props: {
    // 数据获取及展示
    api: {
      type: Object,
      defalut: () => {
        return {
          list: "", //获取初始数据
        };
      },
    },
    // 配置
    config: {
      type: Object,
      default: () => {
        return {
          scroll: null,
          size: "default",
          leftCol: [],
          rightCol: [],
        };
      },
    },
    // 条件筛选
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 穿梭框类型
    transferType: {
      type: String,
      default: "tree",
    },
    rowKey: {
      type: String,
      default: "key",
    },
    // 替换关键字
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
  setup(props) {
    // base
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const targetKeys = ref([]);
    const treeSelectKeys = ref([]);
    const rightSelectKeys = ref([]);
    const state = reactive({
      baseData: [],
      transData: [],
      rightTreeData: [],
      spinning: false,
    });

    const handleTreeData = (data, targetKeys = []) => {
      data.forEach((item) => {
        item["disabled"] = targetKeys.includes(item.key);
        if (item.children) {
          handleTreeData(item.children, targetKeys);
        }
      });
      return data;
    };

    const onChange = (nextTargetKeys) => {
      if (props.transferType === "tree") {
        treeSelectKeys.value = _.cloneDeep(treeSelectKeys.value).filter(
          (item) => !targetKeys.value.includes(item)
        );
        rightSelectKeys.value = [];
        state.transData = handleTreeData(state.transData, nextTargetKeys);
        setRightData();
      }
      targetKeys.value = nextTargetKeys;
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
            .map(({ key }) => key);
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

    const onChecked = (selectKeys, node, selectedKeys, onItemSelect) => {
      const beforeKeys = _.cloneDeep(treeSelectKeys.value);
      const addKeys = _.difference(selectKeys, beforeKeys);
      const deleteKeys = _.difference(beforeKeys, selectKeys);
      if (node?.event) {
        treeSelectKeys.value = selectKeys;
        addKeys.forEach((item) => {
          onItemSelect(item, true);
        });
        deleteKeys.forEach((item) => {
          onItemSelect(item, false);
        });
      }
    };

    // 方法
    const getData = (obj) => {
      let params = {
        ...props.params,
        ...obj,
      };
      if (props.showPage) {
        Object.assign(params, { ...state.pagination });
      }
      state.spinning = true;
      proxy.$api[props.api.list](params, "get").then((res) => {
        if (props.transferType === "tree") {
          state.transData =
            res && res.records
              ? replaceObjectKeys(res.records, { ...props?.config?.field })
              : replaceObjectKeys(res, { ...props?.config?.field });
        } else {
          if (res && res.records) {
            if (props.showPage) {
              state.pagination.total = res.total;
            }
            state.transData = props?.config?.field
              ? replaceObjectKeys(res.records, { ...props?.config?.field })
              : res.records;
          } else {
            state.transData = props?.config?.field
              ? replaceObjectKeys(res, { ...props?.config?.field })
              : res;
          }
        }
        state.baseData = flattenTree(_.cloneDeep(state.transData));
        state.spinning = false;
      });
    };

    const setRightData = async () => {
      const baseData = await _.cloneDeep(state.baseData);
      const checkedItem = baseData.length
        ? baseData.filter((item) => targetKeys.value.includes(item.key))
        : [];
      const rightTree = treezenFiltered(checkedItem, "parentId", "key");
      state.rightTreeData = rightTree?.length ? rightTree : checkedItem;
    };

    const onRightChecked = (selectKeys, node, selectedKeys, onItemSelect) => {
      const beforeKeys = _.cloneDeep(rightSelectKeys.value);
      const addKeys = _.difference(selectKeys, beforeKeys);
      const deleteKeys = _.difference(beforeKeys, selectKeys);
      if (node?.event) {
        rightSelectKeys.value = selectKeys;
        addKeys.forEach((item) => {
          onItemSelect(item, true);
        });
        deleteKeys.forEach((item) => {
          onItemSelect(item, false);
        });
      }
    };

    onMounted(() => {
      getData();
    });

    return {
      targetKeys,
      treeSelectKeys,
      rightSelectKeys,
      ...toRefs(state),
      getRowSelection,
      onRightChecked,
      onChecked,
      onChange,
    };
  },
});
</script>
