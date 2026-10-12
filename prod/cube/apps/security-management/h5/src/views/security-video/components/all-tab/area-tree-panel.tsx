import { Button, Cell, Icon } from "vant";
import { defineComponent, ref, type PropType } from "vue";

import type { MonitorAreaTreeItem } from "@ghcloud/cube-security-management-service";

import styles from "./area-tree-panel.module.less";

function AreaTreeNodes(props: {
  nodes: MonitorAreaTreeItem[];
  depth: number;
  selectedId: string;
  expandedIds: Set<string>;
  onSelect: (node: { id: string; name: string }) => void;
  onToggle: (id: string) => void;
}): JSX.Element {
  const depth = props.depth;
  return (
    <>
      {props.nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const expanded = props.expandedIds.has(String(node.id));
        const selected = props.selectedId === String(node.id);
        return (
          <div key={String(node.id)}>
            <Cell
              clickable
              class={[styles.item, selected && styles.selected]}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
              title={node.name}
              onClick={() => {
                props.onSelect({ id: String(node.id), name: node.name });
              }}
              v-slots={{
                "right-icon": () =>
                  hasChildren ? (
                    <Icon
                      class={styles.expandIcon}
                      name={expanded ? "arrow-down" : "arrow"}
                      onClick={(event: Event) => {
                        event.stopPropagation();
                        props.onToggle(String(node.id));
                      }}
                    />
                  ) : null,
              }}
            />
            {hasChildren && expanded && (
              <AreaTreeNodes
                nodes={node.children!}
                depth={depth + 1}
                selectedId={props.selectedId}
                expandedIds={props.expandedIds}
                onSelect={props.onSelect}
                onToggle={props.onToggle}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export const AreaTreePanel = defineComponent({
  name: "AreaTreePanel",
  props: {
    nodes: { type: Array as PropType<MonitorAreaTreeItem[]>, default: () => [] },
    selectedId: { type: String, default: "" },
    onSelect: { type: Function as PropType<(node: { id: string; name: string }) => void>, required: true },
    onCancel: { type: Function as PropType<() => void>, required: true },
    onReset: { type: Function as PropType<() => void>, required: true },
    onConfirm: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const expandedIds = ref<Set<string>>(new Set());

    const toggleExpand = (id: string): void => {
      const next = new Set(expandedIds.value);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      expandedIds.value = next;
    };

    return (): JSX.Element => (
      <div class={styles.panel}>
        <div class={styles.tree}>
          <AreaTreeNodes
            nodes={props.nodes}
            depth={0}
            selectedId={props.selectedId}
            expandedIds={expandedIds.value}
            onSelect={props.onSelect}
            onToggle={toggleExpand}
          />
        </div>
        <div class={styles.actions}>
          <Button block onClick={props.onCancel}>
            取消
          </Button>
          <Button block onClick={props.onReset}>
            重置
          </Button>
          <Button block type="primary" onClick={props.onConfirm}>
            确认
          </Button>
        </div>
      </div>
    );
  },
});
