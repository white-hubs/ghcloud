import { defineComponent, ref, watch, onMounted, onUnmounted, type PropType } from "vue";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import type { ComponentInstance } from "./types";
import { cloneComponentInstance } from "./schema-utils";
import { logger } from "@/logger";

export interface JsonEditorPanelExposed {
  getContent: () => ComponentInstance[] | null;
  hasErrors: () => boolean;
}

export const JsonEditorPanel = defineComponent({
  props: {
    components: {
      type: Array as PropType<ComponentInstance[]>,
      default: () => [],
    },
  },
  setup(props, { expose }) {
    const editorRef = ref<HTMLDivElement | null>(null);
    const editorInstance = ref<JSONEditor | null>(null);
    const validationErrors = ref<unknown[]>([]);

    const getContent = (): ComponentInstance[] | null => {
      const editor = editorInstance.value;
      if (!editor) {
        return null;
      }
      try {
        const val = editor.get();
        if (Array.isArray(val)) {
          return val as ComponentInstance[];
        }
      } catch (error) {
        logger.warn("JSON 解析失败", error);
      }
      return null;
    };

    const hasErrors = (): boolean => {
      return validationErrors.value.length > 0;
    };

    const initEditor = (): void => {
      if (!editorRef.value) {
        return;
      }
      const editor = new JSONEditor(editorRef.value, {
        mode: "code",
        modes: ["tree", "code", "text", "view"],
        onValidationError: (errors: unknown[]) => {
          validationErrors.value = errors;
        },
      });
      editor.set(props.components.map(cloneComponentInstance));
      editorInstance.value = editor;
    };

    watch(
      () => props.components,
      (val) => {
        const editor = editorInstance.value;
        if (!editor) {
          return;
        }
        try {
          editor.set(val.map(cloneComponentInstance));
        } catch (error) {
          logger.error("JSON 编辑器同步失败", error);
        }
      },
      { deep: true },
    );

    onMounted(() => {
      initEditor();
    });

    onUnmounted(() => {
      if (editorInstance.value) {
        editorInstance.value.destroy();
        editorInstance.value = null;
      }
    });

    expose({
      getContent,
      hasErrors,
    });

    return (): JSX.Element => (
      <div ref={editorRef} style={{ width: "100%", height: "100%" }} />
    );
  },
});
