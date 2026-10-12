import styles from "./index.module.less";
import { Popup, Button, Checkbox, Icon, Search } from "vant";
import { defineComponent, ref, computed, type VNode, watch } from "vue";

interface TreeNode {
  label: string;
  value: string;
  children?: TreeNode[];
}

interface AreaTreeSelectProps {
  modelValue: boolean;
  options: TreeNode[];
  selectedValues: string[];
}

export const AreaTreeSelect = defineComponent({
  name: "AreaTreeSelect",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array as () => TreeNode[],
      default: () => [],
    },
    selectedValues: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  emits: ["update:modelValue", "confirm"],
  setup(props, { emit }) {
    const show = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const selectedIds = ref<string[]>([...props.selectedValues]);
    const searchKeyword = ref("");

    // 监听外部传入的选中值变化
    watch(
      () => props.selectedValues,
      (newVal) => {
        selectedIds.value = [...newVal];
      },
      { immediate: true }
    );

    // 递归过滤 tree 数据（用于搜索）
    const filterTree = (tree: TreeNode[], keyword: string): TreeNode[] => {
      if (!keyword) {
        return tree;
      }
      const lowerKeyword = keyword.toLowerCase();
      const result: TreeNode[] = [];

      for (const node of tree) {
        const matchesKeyword = node.label.toLowerCase().includes(lowerKeyword);
        const filteredChildren = node.children ? filterTree(node.children, keyword) : [];

        if (matchesKeyword || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }
      }

      return result;
    };

    // 过滤后的选项
    const filteredOptions = computed(() => {
      return filterTree(props.options, searchKeyword.value);
    });

    // 切换选中状态
    const toggleSelect = (value: string): void => {
      const index = selectedIds.value.indexOf(value);
      if (index === -1) {
        selectedIds.value.push(value);
      } else {
        selectedIds.value.splice(index, 1);
      }
    };

    // 确认选择
    const handleConfirm = (): void => {
      emit("confirm", [...selectedIds.value]);
      show.value = false;
    };

    // 取消
    const handleCancel = (): void => {
      selectedIds.value = [...props.selectedValues]; // 恢复原始值
      show.value = false;
    };

    // 渲染树节点
    const renderTreeNode = (node: TreeNode, level: number = 0): VNode => {
      const isSelected = selectedIds.value.includes(node.value);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.value}>
          <div
            class={styles.tree_node}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => toggleSelect(node.value)}
          >
            <div class={styles.tree_node_content}>
              {hasChildren && (
                <Icon
                  name="arrow-down"
                  class={styles.tree_arrow}
                  style={{ transform: "rotate(-90deg)" }}
                />
              )}
              <Checkbox
                modelValue={isSelected}
                onClick={(e: Event) => {
                  e.stopPropagation();
                  toggleSelect(node.value);
                }}
              />
              <span class={styles.tree_label}>{node.label}</span>
            </div>
          </div>
          {hasChildren &&
            node.children!.map((child) => renderTreeNode(child, level + 1))}
        </div>
      );
    };

    return (): VNode => (
      <Popup
        v-model:show={show.value}
        position="bottom"
        round
        style={{ height: "80%" }}
        onUpdate:show={(val) => {
          if (!val) {
            handleCancel();
          }
        }}
      >
        <div class={styles.area_tree_select}>
          <div class={styles.area_tree_header}>
            <div class={styles.area_tree_title}>选择网格/区域</div>
            <div class={styles.area_tree_selected_count}>
              已选：{selectedIds.value.length} 项
            </div>
          </div>
          <div class={styles.area_tree_search}>
            <Search
              v-model={searchKeyword.value}
              placeholder="请输入区域名称搜索"
              shape="round"
            />
          </div>
          <div class={styles.area_tree_content}>
            {filteredOptions.value.length > 0 ? (
              filteredOptions.value.map((node) => renderTreeNode(node))
            ) : (
              <div class={styles.area_tree_empty}>暂无数据</div>
            )}
          </div>
          <div class={styles.area_tree_footer}>
            <Button block onClick={handleCancel}>
              取消
            </Button>
            <Button block type="primary" onClick={handleConfirm}>
              确定
            </Button>
          </div>
        </div>
      </Popup>
    );
  },
});


