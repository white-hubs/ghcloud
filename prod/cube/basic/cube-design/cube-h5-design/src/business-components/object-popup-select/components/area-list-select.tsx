import { cubeMdataService } from "../../../api/service";
import styles from "./base-select-popup/base-select-popup.module.less";
import type { AreaTree } from "@ghcloud/cube-mdata-service";
import { List, PullRefresh, Empty, Checkbox } from "vant";
import { defineComponent, reactive, ref } from "vue";

interface AreaListSelectProps {
  value: string[];
  selectedItems?: AreaTree[];
  multiple?: boolean;
}

type AreaTreeWithChildren = AreaTree & {
  id?: string | number;
  name?: string;
  code?: string;
  children?: AreaTreeWithChildren[] | null;
};

const getChildren = (node: AreaTreeWithChildren): AreaTreeWithChildren[] => node.children ?? [];

const matchArea = (node: AreaTreeWithChildren, keyword: string): boolean => {
  const lower = keyword.toLowerCase();
  const name = (node.name || "").toLowerCase();
  const code = (node.code || "").toLowerCase();
  return name.includes(lower) || code.includes(lower);
};

const filterAreaTree = (nodes: AreaTreeWithChildren[], keyword: string): AreaTreeWithChildren[] => {
  if (!keyword) {
    return nodes;
  }

  const dfs = (list: AreaTreeWithChildren[]): AreaTreeWithChildren[] =>
    list
      .map((node) => {
        const children = getChildren(node);
        const filteredChildren = dfs(children);
        if (matchArea(node, keyword) || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((item): item is AreaTreeWithChildren => item !== null);

  return dfs(nodes);
};

const collectExpandedIds = (nodes: AreaTreeWithChildren[]): string[] => {
  const result: string[] = [];
  const walk = (list: AreaTreeWithChildren[]): void => {
    list.forEach((node) => {
      const id = `${node.id ?? ""}`;
      const children = getChildren(node);
      if (children.length > 0) {
        result.push(id);
        walk(children);
      }
    });
  };
  walk(nodes);
  return result;
};

export const AreaListSelect = defineComponent({
  props: ["value", "selectedItems", "multiple"],
  emits: ["update:value", "update:selectedItems", "select"],
  setup(props: AreaListSelectProps, { emit, expose }) {
    const allTree = ref<AreaTreeWithChildren[]>([]);
    const displayTree = ref<AreaTreeWithChildren[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive({
      keyword: "",
    });
    const expandedIds = ref<string[]>([]);

    const loadAreaTree = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeMdataService.getAreaTree();
        allTree.value = (res || []) as AreaTreeWithChildren[];
        displayTree.value = allTree.value;
        expandedIds.value = collectExpandedIds(displayTree.value);
        finished.value = true;
      } catch {
        finished.value = true;
        displayTree.value = [];
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const onLoad = async (): Promise<void> => {
      if (finished.value && allTree.value.length > 0) {
        return;
      }
      await loadAreaTree();
    };

    const onRefresh = (): void => {
      finished.value = false;
      allTree.value = [];
      displayTree.value = [];
      expandedIds.value = [];
      loadAreaTree();
    };

    const handleSearch = (keyword: string): void => {
      search.keyword = keyword;
      if (search.keyword) {
        displayTree.value = filterAreaTree(allTree.value, search.keyword);
        expandedIds.value = collectExpandedIds(displayTree.value);
        return;
      }
      displayTree.value = allTree.value;
      expandedIds.value = collectExpandedIds(displayTree.value);
    };

    const toggleSelect = (item: AreaTreeWithChildren): void => {
      let newIds: string[] = [...props.value];
      let newItems: AreaTreeWithChildren[] = [...(props.selectedItems || [])];
      const curId = `${item.id ?? ""}`;
      if (props.multiple) {
        const index = props.value.findIndex((id) => id === curId);
        if (index === -1) {
          newIds.push(curId);
          newItems.push(item);
        } else {
          newIds.splice(index, 1);
          newItems.splice(index, 1);
        }
      } else {
        newIds = [curId];
        newItems = [item];
      }
      emit("update:value", newIds);
      emit("update:selectedItems", newItems);
      emit("select", { ids: newIds, items: newItems });
    };

    const toggleExpand = (id: string, hasChildren: boolean): void => {
      if (!hasChildren) {
        return;
      }
      const index = expandedIds.value.indexOf(id);
      if (index === -1) {
        expandedIds.value.push(id);
      } else {
        expandedIds.value.splice(index, 1);
      }
    };

    const clearSelection = (): void => {
      emit("update:value", []);
      emit("update:selectedItems", []);
      emit("select", { ids: [], items: [] });
    };

    expose({
      clearSelection,
      handleSearch,
    });

    const renderTree = (nodes: AreaTreeWithChildren[], level = 0): JSX.Element[] =>
      nodes.flatMap((item) => {
        const id = `${item.id ?? ""}`;
        const children = getChildren(item);
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.value.includes(id);
        const isChecked = props.value.includes(id);

        const row = (
          <div key={id} class={styles["tree-row"]} onClick={() => toggleSelect(item)}>
            <div class={styles["title"]}>
              <div class={styles["tree-title"]} style={{ marginLeft: `${level * 16}px` }}>
                {hasChildren && (
                  <span
                    class={styles["tree-expand-icon"]}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      toggleExpand(id, hasChildren);
                    }}
                  >
                    {isExpanded ? "▼" : "▶"}
                  </span>
                )}
                <span class={styles["title-name"]}>{item.name || "--"}</span>
              </div>
              <Checkbox
                name={id}
                modelValue={isChecked}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  toggleSelect(item);
                }}
              />
            </div>
          </div>
        );

        if (!hasChildren || !isExpanded) {
          return [row];
        }
        return [row, ...renderTree(children, level + 1)];
      });

    return (): JSX.Element => (
      <PullRefresh
        v-model={refreshing.value}
        onRefresh={onRefresh}
        class={styles["list-pull-refresh"]}
        style={{ height: props.multiple ? "calc(100vh - 210px)" : "calc(100vh - 150px)" }}
      >
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={displayTree.value.length === 0 ? "" : "暂无更多数据"}
          onLoad={onLoad}
        >
          {displayTree.value.length > 0 && renderTree(displayTree.value)}
          {displayTree.value.length === 0 && finished.value && <Empty description="暂无数据" />}
        </List>
      </PullRefresh>
    );
  },
});
