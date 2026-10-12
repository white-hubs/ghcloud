import styles from "./index.module.less";
import { cubeMdataService } from "@/api/server";
import type { AreaTree } from "@ghcloud/cube-mdata-service";
import { Button, Icon } from "vant";
import { defineComponent, onMounted, reactive } from "vue";

/**
 * 递归给树形数据每一项新增label字段（值为当前项的name）
 * @param {Array} treeData - 原始树形数据
 * @returns {Array} - 处理后的树形数据
 */
function addTextToTree(treeData: AreaTree[]) {
  // 深拷贝避免修改原数据（可选，根据业务需求调整）
  const newTree = JSON.parse(JSON.stringify(treeData));

  // 递归处理每一项
  function recursion(nodeList: AreaTree[]) {
    nodeList.forEach((node) => {
      // 新增label字段，值为当前项的name（兼容name为空的情况）
      node.text = node.name || "";
      // 如果有子节点，递归处理子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        recursion(node.children);
      }
    });
  }

  recursion(newTree);
  return newTree;
}

/**
 * 深度查找节点
 */
function findNodeById(tree: AreaTree[], id: string): AreaTree | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export const GridTree = defineComponent({
  emits: ["confirm", "getAreaTreeData"],
  setup: (props, { emit }) => {
    const state = reactive<{
      treeData: AreaTree[];
      activeId: string;
      expandedKeys: string[];
    }>({
      treeData: [],
      activeId: "",
      expandedKeys: [],
    });

    const getAreaTree = async () => {
      const result = await cubeMdataService.getAreaTree();
      emit("getAreaTreeData", result);
      state.treeData = addTextToTree(result);
    };

    onMounted(() => {
      getAreaTree();
    });

    const toggleExpand = (id: string, event: MouseEvent) => {
      event.stopPropagation();
      const index = state.expandedKeys.indexOf(id);
      if (index > -1) {
        state.expandedKeys.splice(index, 1);
      } else {
        state.expandedKeys.push(id);
      }
    };

    const handleSelect = (id: string) => {
      state.activeId = id;
    };

    function renderTree(nodes: AreaTree[], level = 0): JSX.Element[] {
      return nodes.map((node) => {
        const isExpanded = state.expandedKeys.includes(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isActive = state.activeId === node.id;

        return (
          <>
            <div class={[styles.treeNode, isActive ? styles.active : ""]} onClick={() => handleSelect(node.id)}>
              {/* Indentation spacer using padding-left on the container, or a spacer div.
                  Using style paddingLeft is simpler but flex items align left. 
                  Let's use a spacer div logic or just padding on the row? 
                  If I use padding on the row, the whole row is clickable. 
                  The icon needs to be at the left-most logical position for that level.
                  Actually, usually the indent is applied to the content wrapper, but here I'm rendering a flat list visually via recursion.
              */}
              <div
                class={[styles.iconContainer, isExpanded ? styles.expanded : ""]}
                style={{ marginLeft: `${level * 16}px` }}
                onClick={(e) => hasChildren && toggleExpand(node.id, e)}
              >
                {hasChildren && <Icon name="arrow" />}
              </div>
              <div class={styles.nodeContent}>{node.name}</div>
              {isActive && <Icon name="success" class={styles.checkIcon} />}
            </div>
            {hasChildren && isExpanded && renderTree(node.children, level + 1)}
          </>
        );
      });
    }

    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.treeContainer}>{renderTree(state.treeData)}</div>
        <div class={styles.button}>
          <Button
            class={styles.btn}
            onClick={() => {
              state.activeId = "";
              state.expandedKeys = [];
            }}
            type="default"
            block
            size="small"
          >
            重置
          </Button>
          <Button
            class={styles.btn}
            type="primary"
            size="small"
            onClick={() => {
              const node = findNodeById(state.treeData, state.activeId);
              emit("confirm", {
                id: state.activeId,
                name: node?.name || "",
              });
            }}
            block
          >
            确定
          </Button>
        </div>
      </div>
    );
  },
});
