import { defineComponent, reactive, watch, ref, type PropType } from "vue";

import { Drawer, Button, message } from "@ghcloud/cube-ui";

import { CanvasPanel } from "./canvas-panel";
import { ComponentPanel } from "./component-panel";
import { ConfigPanel } from "./config-panel";
import { JsonEditorPanel } from "./json-editor-panel";
import type { JsonEditorPanelExposed } from "./json-editor-panel";
import { cloneComponentInstance } from "./schema-utils";
import type { ComponentInstance, DesignerMode, DesignerState } from "./types";

import styles from "./page-designer.module.less";

export const PageDesigner = defineComponent({
  props: {
    mode: {
      type: String as PropType<DesignerMode>,
      default: "page",
    },
    modelValue: {
      type: Array as PropType<ComponentInstance[]>,
      default: () => [],
    },
    primaryColor: {
      type: String as PropType<string>,
      default: "#1578FF",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const state = reactive<DesignerState>({
      components: [],
      selectedIndex: null,
    });

    const jsonDrawerVisible = ref(false);
    const jsonEditorRef = ref<JsonEditorPanelExposed | null>(null);

    // 同步外部 modelValue
    watch(
      () => props.modelValue,
      (val) => {
        state.components = val.map(cloneComponentInstance);
        if (state.selectedIndex !== null && state.selectedIndex >= state.components.length) {
          state.selectedIndex = null;
        }
      },
      { immediate: true, deep: true },
    );

    // 内部变化时同步到外部
    const emitUpdate = (): void => {
      emit("update:modelValue", state.components.map(cloneComponentInstance));
    };

    const handleAdd = (instance: ComponentInstance): void => {
      if (instance.name === "__slot__" && state.components.some((c) => c.name === "__slot__")) {
        message.warning("布局中只能添加一个内容插槽");
        return;
      }
      state.components.push(cloneComponentInstance(instance));
      state.selectedIndex = state.components.length - 1;
      emitUpdate();
    };

    const handleSelect = (index: number): void => {
      state.selectedIndex = index;
    };

    const handleMoveUp = (index: number): void => {
      if (index <= 0) {
        return;
      }
      const temp = state.components[index];
      state.components[index] = state.components[index - 1];
      state.components[index - 1] = temp;
      state.selectedIndex = index - 1;
      emitUpdate();
    };

    const handleMoveDown = (index: number): void => {
      if (index >= state.components.length - 1) {
        return;
      }
      const temp = state.components[index];
      state.components[index] = state.components[index + 1];
      state.components[index + 1] = temp;
      state.selectedIndex = index + 1;
      emitUpdate();
    };

    const handleDelete = (index: number): void => {
      state.components.splice(index, 1);
      if (state.selectedIndex === index) {
        state.selectedIndex = null;
      } else if (state.selectedIndex !== null && state.selectedIndex > index) {
        state.selectedIndex -= 1;
      }
      emitUpdate();
    };

    const handleUpdateProps = (newProps: Record<string, unknown>): void => {
      if (state.selectedIndex === null) {
        return;
      }
      const instance = state.components[state.selectedIndex];
      if (!instance) {
        return;
      }
      state.components[state.selectedIndex] = {
        ...instance,
        props: newProps,
      };
      emitUpdate();
    };

    const handleJsonUpdate = (components: ComponentInstance[]): void => {
      state.components = components.map(cloneComponentInstance);
      emitUpdate();
    };

    const handleOpenJsonEditor = (): void => {
      jsonDrawerVisible.value = true;
    };

    const handleCloseJsonDrawer = (): void => {
      jsonDrawerVisible.value = false;
    };

    const handleSaveJson = (): void => {
      const editor = jsonEditorRef.value;
      if (!editor) {
        return;
      }

      if (editor.hasErrors()) {
        message.error("JSON 存在语法错误，请修正后再保存");
        return;
      }

      const content = editor.getContent();
      if (content === null) {
        message.error("JSON 格式无效，请确保为正确的数组格式");
        return;
      }

      handleJsonUpdate(content);
      jsonDrawerVisible.value = false;
      message.success("JSON 设置成功");
    };

    return (): JSX.Element => {
      const selectedInstance = state.selectedIndex !== null ? state.components[state.selectedIndex] : null;

      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div class={styles.designer}>
            <ComponentPanel mode={props.mode} onAdd={handleAdd} />
            <CanvasPanel
              components={state.components}
              selectedIndex={state.selectedIndex}
              primaryColor={props.primaryColor}
              onSelect={handleSelect}
              onMove-up={handleMoveUp}
              onMove-down={handleMoveDown}
              onDelete={handleDelete}
              onOpen-json-editor={handleOpenJsonEditor}
            />
            <ConfigPanel instance={selectedInstance} onUpdate-props={handleUpdateProps} />
          </div>
          <Drawer
            open={jsonDrawerVisible.value}
            onClose={handleCloseJsonDrawer}
            title="JSON 编辑"
            width={800}
            placement="right"
            destroyOnClose={false}
            bodyStyle={{ padding: 0 }}
            v-slots={{
              footer: () => (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <Button onClick={handleCloseJsonDrawer}>取消</Button>
                  <Button type="primary" onClick={handleSaveJson}>
                    保存
                  </Button>
                </div>
              ),
            }}
          >
            <div style={{ height: "calc(100vh - 180px)" }}>
              <JsonEditorPanel ref={jsonEditorRef} components={state.components} />
            </div>
          </Drawer>
        </div>
      );
    };
  },
});
