import { computed, defineComponent, shallowRef, watch, type PropType } from "vue";

import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";
import { Input, Tree } from "@ghcloud/cube-ui";

import type { AreaPerspectiveMarker } from "./perspective-association";

import styles from "./perspective-configuration.module.less";

const filterAreaTree = (nodes: BusinessAreaNode[], keyword: string): BusinessAreaNode[] =>
  nodes.flatMap((node) => {
    const ownMatched = node.name.toLocaleLowerCase().includes(keyword);
    if (ownMatched) {
      return [node];
    }

    const children = filterAreaTree(node.children ?? [], keyword);
    return children.length > 0 ? [{ ...node, children }] : [];
  });

const collectExpandableKeys = (nodes: BusinessAreaNode[]): string[] => {
  const keys: string[] = [];

  const visit = (items: BusinessAreaNode[]): void => {
    items.forEach((item) => {
      if ((item.children?.length ?? 0) > 0) {
        keys.push(item.id);
        visit(item.children ?? []);
      }
    });
  };

  visit(nodes);
  return keys;
};

const formatUnconfiguredCount = (count: number): string => (count > 99 ? "99+" : String(count));

export const PerspectiveAreaTree = defineComponent({
  name: "PerspectiveAreaTree",
  props: {
    treeData: {
      type: Array as PropType<BusinessAreaNode[]>,
      default: () => [],
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    markerMap: {
      type: Object as PropType<Map<string, AreaPerspectiveMarker>>,
      default: () => new Map<string, AreaPerspectiveMarker>(),
    },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const keywordInput = shallowRef("");
    const keyword = shallowRef("");
    const expandedKeys = shallowRef<string[]>([]);
    const normalizedKeyword = computed(() => keyword.value.trim().toLocaleLowerCase());
    const filteredTreeData = computed(() =>
      normalizedKeyword.value ? filterAreaTree(props.treeData, normalizedKeyword.value) : props.treeData,
    );
    const visibleExpandedKeys = computed(() =>
      normalizedKeyword.value ? collectExpandableKeys(filteredTreeData.value) : expandedKeys.value,
    );
    const unconfiguredTotal = computed(() => props.markerMap.get(props.treeData[0]?.id ?? "")?.count ?? 0);

    const handleQuery = (): void => {
      keyword.value = keywordInput.value.trim();
    };

    watch(
      () => props.treeData,
      (treeData) => {
        const rootId = treeData[0]?.id;
        if (rootId && expandedKeys.value.length === 0) {
          expandedKeys.value = [rootId];
        }
      },
      { immediate: true },
    );

    const renderTreeTitle = (node: BusinessAreaNode): JSX.Element => {
      const marker = props.markerMap.get(node.id);
      const showDot = Boolean(marker?.showDot);
      const count = marker?.count ?? 0;
      return (
        <span class={styles.treeNodeTitle}>
          <span class={styles.treeNodeName} title={node.name}>
            {node.name}
          </span>
          {showDot ? <span class={styles.treeNodeDot} title="未配置视角" aria-label="未配置视角" /> : null}
          {count > 0 ? (
            <span class={styles.treeNodeCount} title={`${count} 个区域未配置视角`} aria-label={`${count} 个区域未配置视角`}>
              {formatUnconfiguredCount(count)}
            </span>
          ) : null}
        </span>
      );
    };

    return () => (
      <aside class={styles.treePane}>
        <div class={styles.treeSearch}>
          <Input
            value={keywordInput.value}
            maxlength={50}
            allowClear
            placeholder="请输入区域名称"
            class={styles.treeSearchInput}
            onUpdate:value={(value: string) => {
              keywordInput.value = value ?? "";
            }}
            onPressEnter={handleQuery}
            onChange={handleQuery}
          />
          {unconfiguredTotal.value > 0 ? (
            <div class={styles.treeHint} title={`${unconfiguredTotal.value} 个区域尚未配置视角`}>
              <span class={styles.treeNodeDot} aria-hidden="true" />
              <span>{unconfiguredTotal.value > 99 ? "99+" : unconfiguredTotal.value} 个区域未配置视角</span>
            </div>
          ) : null}
        </div>
        <div class={styles.treeScroll}>
          {filteredTreeData.value.length > 0 ? (
            <Tree
              treeData={filteredTreeData.value}
              fieldNames={{ children: "children", title: "name", key: "id" }}
              selectedKeys={props.selectedKeys}
              expandedKeys={visibleExpandedKeys.value}
              onExpand={(keys: (string | number)[]) => {
                if (!normalizedKeyword.value) {
                  expandedKeys.value = keys.map(String);
                }
              }}
              onSelect={(keys: (string | number)[]) => {
                emit("select", keys.map(String).slice(0, 1));
              }}
              v-slots={{
                title: (slotProps: { data?: BusinessAreaNode; dataRef?: BusinessAreaNode } & BusinessAreaNode) => {
                  const data = slotProps.data ?? slotProps.dataRef ?? slotProps;
                  return renderTreeTitle(data);
                },
              }}
            />
          ) : (
            <div class={styles.treeEmpty}>未找到匹配区域</div>
          )}
        </div>
      </aside>
    );
  },
});

export default PerspectiveAreaTree;
