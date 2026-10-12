import { defineComponent, type PropType } from "vue";
import { getComponentsByMode, getSlotComponent } from "./component-registry";
import { createComponentInstance } from "./schema-utils";
import type { ComponentInstance, DesignerMode } from "./types";
import styles from "./component-panel.module.less";

/** 分组顺序 */
const CATEGORY_ORDER = [
  "布局",
  "Banner与头部",
  "能力与展示",
  "产品与资源",
  "案例与行业",
  "内容与关于",
  "表单与交互",
];

export const ComponentPanel = defineComponent({
  props: {
    mode: {
      type: String as PropType<DesignerMode>,
      default: "page",
    },
  },
  emits: ["add"],
  setup(props, { emit }) {
    const handleAdd = (name: string): void => {
      const registryItem =
        name === "__slot__"
          ? getSlotComponent()
          : getComponentsByMode(props.mode).find((item) => item.name === name);

      if (!registryItem) {
        return;
      }

      const instance = createComponentInstance(name, registryItem.schema);
      emit("add", instance);
    };

    const groupItems = (items: ReturnType<typeof getComponentsByMode>) => {
      const groups = new Map<string, typeof items>();
      for (const item of items) {
        const category = item.category ?? "其他";
        if (!groups.has(category)) {
          groups.set(category, []);
        }
        groups.get(category)!.push(item);
      }
      return groups;
    };

    return (): JSX.Element => {
      const items = getComponentsByMode(props.mode);
      // 布局模式下添加 __slot__ 占位符
      const allItems =
        props.mode === "layout" ? [...items, getSlotComponent()] : items;

      const groups = groupItems(allItems);
      const sortedCategories = CATEGORY_ORDER.filter((c) => groups.has(c));
      if (groups.has("其他") && !sortedCategories.includes("其他")) {
        sortedCategories.push("其他");
      }

      return (
        <div class={styles.panel}>
          <div class={styles.header}>{allItems.length} 个组件</div>
          <div class={styles.list}>
            {sortedCategories.map((category) => (
              <div key={category} class={styles.group}>
                <div class={styles.groupHeader}>{category}</div>
                {groups.get(category)!.map((item) => (
                  <div
                    key={item.name}
                    class={styles.item}
                    onClick={() => handleAdd(item.name)}
                    title={item.description}
                  >
                    <div class={styles.itemIcon}>
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div class={styles.itemInfo}>
                      <div class={styles.itemTitle}>{item.title}</div>
                      <div class={styles.itemDesc}>{item.description}</div>
                    </div>
                    <span class={styles.addIcon}>+</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    };
  },
});
