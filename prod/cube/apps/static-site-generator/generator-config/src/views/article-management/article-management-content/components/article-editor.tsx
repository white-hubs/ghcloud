import styles from "./article-editor.module.less";
import "../wangeditor-editor.css";
import type { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { defineComponent, onBeforeUnmount, ref, shallowRef, watch, type PropType } from "vue";

interface EditorProps {
  text?: string;
  height?: number;
  placeholder?: string;
}

/** 文章富文本编辑器（基于 WangEditor） */
export const ArticleEditor = defineComponent({
  props: {
    text: {
      type: String as PropType<string>,
      default: "",
    },
    height: {
      type: Number as PropType<number>,
      default: 350,
    },
    placeholder: {
      type: String as PropType<string>,
      default: "请填写内容",
    },
  },
  emits: ["getHtml", "onCreated"],
  setup: (props: EditorProps, { emit }) => {
    const editorRef = shallowRef<IDomEditor>();
    const isUserEditing = ref(false);
    const lastHtml = ref("");
    const valueHtml = ref(props.text || "");

    const editorConfig = ref<Partial<IEditorConfig>>({
      placeholder: props.placeholder ?? "",
      readOnly: false,
    });

    const toolbarConfig = ref<Partial<IToolbarConfig>>({
      toolbarKeys: [
        "headerSelect",
        "bold",
        "italic",
        "underline",
        "through",
        "|",
        "fontSize",
        "fontFamily",
        "color",
        "bgColor",
        "|",
        "bulletedList",
        "numberedList",
        "todo",
        "|",
        "justifyLeft",
        "justifyCenter",
        "justifyRight",
        "|",
        "insertLink",
        "|",
        "blockquote",
        "codeBlock",
        "|",
        "undo",
        "redo",
        "fullScreen",
      ],
    });

    const handleCreated = (editor: IDomEditor): void => {
      editorRef.value = editor;
      emit("onCreated", editor);
    };

    const handleChange = (editor: IDomEditor): void => {
      isUserEditing.value = true;
      const html = editor.getHtml();
      valueHtml.value = html;
      lastHtml.value = html;
      emit("getHtml", html);
    };

    watch(
      () => props.text,
      (newVal) => {
        if (!newVal || isUserEditing.value) {
          return;
        }
        if (lastHtml.value !== newVal) {
          valueHtml.value = newVal;
          lastHtml.value = newVal;
          if (editorRef.value && newVal !== editorRef.value.getHtml()) {
            editorRef.value.setHtml(newVal);
          }
        }
      },
    );

    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor === null) {
        return;
      }
      editor && editor.destroy();
    });

    return (): JSX.Element => (
      <div class={styles.editorContainer} style={{ height: `${props.height}px` }}>
        <Toolbar editor={editorRef.value} defaultConfig={toolbarConfig.value} mode="default" style={{ borderBottom: "1px solid #ccc" }} />
        <Editor
          defaultConfig={editorConfig.value}
          mode="default"
          modelValue={valueHtml.value}
          style={{ height: `${(props.height ?? 350) - 42}px`, overflowY: "hidden" }}
          /* @ts-expect-error */
          onOnCreated={handleCreated}
          onOnChange={handleChange}
          class={styles.editor}
        />
      </div>
    );
  },
});
