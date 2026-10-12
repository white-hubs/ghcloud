import { defineComponent, type PropType } from "vue";
import { getComponentByName } from "./component-registry";
import { DynamicForm } from "./dynamic-form";
import type { ComponentInstance } from "./types";
import styles from "./config-panel.module.less";

export const ConfigPanel = defineComponent({
  props: {
    instance: {
      type: Object as PropType<ComponentInstance | null>,
      default: null,
    },
  },
  emits: ["update-props"],
  setup(props, { emit }) {
    const handleUpdateProps = (newProps: Record<string, unknown>): void => {
      emit("update-props", newProps);
    };

    return (): JSX.Element => {
      const { instance } = props;
      const registryItem = instance ? getComponentByName(instance.name) : undefined;

      return (
        <div class={styles.panel}>
          <div class={styles.header}>
            {instance ? `${registryItem?.title ?? instance.name} 配置` : "组件配置"}
          </div>
          <div class={[styles.content, "custom-scrollbar"]}>
            <DynamicForm
              instance={instance}
              schema={registryItem?.schema ?? null}
              onUpdate={handleUpdateProps}
            />
          </div>
        </div>
      );
    };
  },
});
