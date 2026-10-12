<template>
  <div>
    <a-spin :spinning="spinning">
      <a-transfer
        ref="transferRef"
        :data-source="transferType === 'table' ? transData : baseData"
        :target-keys="targetKeys"
        :disabled="disabled"
        :titles="titles"
        :show-search="showSearch"
        :render="(item) => item.title"
        :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
        :show-select-all="showSelectAll"
        @change="onChange"
        @selectChange="selectChange"
      >
        <template #children="{ direction, filteredItems, selectedKeys, disabled: listDisabled, onItemSelectAll, onItemSelect }">
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
                @check="
                  (_, props) => {
                    onChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
                  }
                "
                @select="
                  (_, props) => {
                    onChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
                  }
                "
              ></a-tree>
            </template>
            <template v-else>
              <!-- :fieldNames="field" -->
              <a-tree
                :treeData="rightTreeData"
                checkable
                blockNode
                defaultExpandAll
                :selectable="false"
                :checkedKeys="rightSelectKeys"
                @check="
                  (_, props) => {
                    onRightChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
                  }
                "
                @select="
                  (_, props) => {
                    onRightChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
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
<script>
import { LockOutlined } from "@ant-design/icons-vue";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import { getCurrentInstance, defineComponent, onMounted, reactive, computed, toRefs, watch, unref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { flattenTree, treezenFiltered, treezen } from "../../../utils/common";
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
    // 是否筛选
    showSelectAll: {
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
    const transferRef = ref();
    const treeSelectKeys = ref([]);
    const rightSelectKeys = ref([]);
    const state = reactive({
      baseData: [],
      transData: [],
      rightTreeData: [],
      spinning: false,
      targetItems: [],
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

    const onChange = async (nextTargetKeys, direction) => {
      if (direction === "left") {
        // 右到左
        targetKeys.value = targetKeys.value.filter((item) => nextTargetKeys.includes(item));
        if (props.transferType === "tree") {
          treeSelectKeys.value = await _.cloneDeep(treeSelectKeys.value).filter((item) => !targetKeys.value.includes(item));
          rightSelectKeys.value = [];
          state.transData = await handleTreeData(state.transData, targetKeys.value);
          setRightData();
        }
      } else {
        targetKeys.value = nextTargetKeys;
        if (props.transferType === "tree") {
          state.transData = await handleTreeData(state.transData, targetKeys.value);
          setRightData();
        }
      }
    };

    const getRowSelection = ({ disabled, selectedKeys, onItemSelectAll, onItemSelect }) => {
      return {
        getCheckboxProps: (item) => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
          const diffKeys = selected ? _.difference(treeSelectedKeys, selectedKeys) : _.difference(selectedKeys, treeSelectedKeys);
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
            res && res.records ? replaceObjectKeys(res.records, { ...props?.field }) : replaceObjectKeys(res, { ...props?.field });
          state.baseData = flattenTree(_.cloneDeep(state.transData));
          state.transData = handleTreeData(state.transData, targetKeys.value);
          setRightData();
        } else {
          if (res && res.records) {
            if (props.showPage) {
              state.pagination.total = res.total;
            }
            state.transData = props?.field ? replaceObjectKeys(res.records, { ...props?.field }) : res.records;
          } else {
            state.transData = props?.field ? replaceObjectKeys(res, { ...props?.field }) : res;
          }
        }

        state.spinning = false;
      });
    };

    const setRightData = async () => {
      const baseData = await _.cloneDeep(state.baseData);
      const checkedItem = baseData.length ? baseData.filter((item) => targetKeys.value.includes(item.key)) : [];
      const rightTree = treezenFiltered([], checkedItem, "parentId", "key");
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

    const selectChange = (sourceSelectedKeys, targetSelectedKeys) => {
      treeSelectKeys.value = sourceSelectedKeys;
      rightSelectKeys.value = targetSelectedKeys;
    };

    const getItem = (record) => {
      state.targetItems = state.baseData.filter((item) => record.includes(item.key));
    };

    const reset = () => {
      if (props.transferType === "tree") {
        treeSelectKeys.value.forEach((item) => {
          transferRef.value.onLeftItemSelect(item, false);
        });
        treeSelectKeys.value = [];
        rightSelectKeys.value.forEach((item) => {
          transferRef.value.onRightItemSelect(item, false);
        });
        rightSelectKeys.value = [];

        state.rightTreeData = [];
      } else {
        const keys = state.transData.map((item) => item.key);
        keys.forEach((item) => {
          transferRef.value.onLeftItemSelect(item, false);
          transferRef.value.onRightItemSelect(item, false);
        });
      }
      targetKeys.value = [];
      getData();
    };

    onMounted(() => {
      getData();
    });

    watch(
      () => targetKeys.value,
      (n) => {
        getItem(n);
      },
      {
        deep: true,
      },
    );

    return {
      targetKeys,
      transferRef,
      treeSelectKeys,
      rightSelectKeys,
      ...toRefs(state),
      getRowSelection,
      onRightChecked,
      selectChange,
      onChecked,
      onChange,
      getData,
      reset,
    };
  },
});
</script>
