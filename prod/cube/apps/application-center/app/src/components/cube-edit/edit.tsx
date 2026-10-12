import { authStore } from '@/api/auth-store'
import {
  defineComponent,
  onMounted,
  ref,
  type PropType,
  watch,
  shallowRef,
  onBeforeUnmount
} from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import styles from './edit.module.less'

interface EditorProps {
  id?: string;
  height?: number;
  zIndex?: number;
  text?: string;
  max?: number;
  sceneCode?: string;
  placeholder?: string;
}

/**
 * 富文本编辑器组件，基于@wangeditor/editor实现
 */
export const CubeEdit = defineComponent({
  props: {
    id: {
      type: String as PropType<string>,
      default: 'content'
    },
    height: {
      type: Number as PropType<number>,
      default: 350
    },
    zIndex: {
      type: Number as PropType<number>,
      default: 2
    },
    text: {
      type: String as PropType<string>,
      default: ''
    },
    max: {
      type: Number as PropType<number>,
      default: 1
    },
    sceneCode: {
      type: String as PropType<string>,
      default: 'OUAA::APP'
    },
    placeholder: {
      type: String as PropType<string>,
      default: '请填写内容'
    }
  },
  emits: ['getHtml'],
  setup: (props: EditorProps, { emit }) => {
    const editorRef = shallowRef<IDomEditor>()
    const isUserEditing = ref(false)
    const lastHtml = ref('')
    const valueHtml = ref(props.text || '')


    // 编辑器配置
    const editorConfig = ref<Partial<IEditorConfig>>({
      placeholder: props.placeholder ?? '',
      readOnly: false,
      MENU_CONF: {
        // 图片上传配置
        uploadImage: {
          server: '/api/file/upload/temporary',
          fieldName: 'file',
          maxFileSize: 10 * 1024 * 1024, // 限制上传文件大小，默认为10M
          maxNumberOfFiles: props.max || 5, // 限制一次最多能传几张图片
          allowedFileTypes: ['image/*'],
          meta: {
            businessKey: 'ouaa',
            sceneCode: props.sceneCode || 'OUAA::APP'
          },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            tenant: authStore.tenant,
            terminal: authStore.terminal || 'bimops-manage-web'
          },
          // 自定义上传逻辑
          customInsert (res: { path: string; }, insertFn: Function) {
            if (res) {
              insertFn(res.path)
            } else {
            }
          },
        }
      }
    })

    // 工具栏配置
    const toolbarConfig = ref<Partial<IToolbarConfig>>({
      toolbarKeys: [
        'headerSelect',
        'bold',
        'italic',
        'underline',
        'through',
        '|',
        'fontSize',
        'fontFamily',
        'color',
        'bgColor',
        '|',
        'bulletedList',
        'numberedList',
        'todo',
        '|',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        '|',
        'insertLink',
        'uploadImage',
        '|',
        'blockquote',
        'codeBlock',
        '|',
        'undo',
        'redo',
        'fullScreen'
      ]
    })

    /**
     * 编辑器创建完成回调
     */
    const handleCreated = (editor: IDomEditor): void => {
      editorRef.value = editor
    }

    /**
     * 编辑器内容变化回调
     */
    const handleChange = (editor: IDomEditor): void => {
      // 标记用户正在编辑
      isUserEditing.value = true

      // 获取当前HTML内容
      const html = editor.getHtml()
      valueHtml.value = html

      // 更新最后的HTML内容
      lastHtml.value = html

      // 触发getHtml事件
      emit('getHtml', html)
    }

    // 监听props.text变化，但只在用户没有编辑时更新内容
    watch(() => props.text, (newVal) => {
      if (!newVal || isUserEditing.value) return

      // 检查内容是否真的变化了
      if (lastHtml.value !== newVal) {
        valueHtml.value = newVal
        lastHtml.value = newVal
        if (editorRef.value && newVal !== editorRef.value.getHtml()) {
          editorRef.value.setHtml(newVal)
        }
      }
    })

    // 初始化内容
    onMounted(() => {
      valueHtml.value = props.text || ''
      lastHtml.value = props.text || ''
    })

    // 组件销毁时清理编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor === null) return
      editor && editor.destroy()
    })

    return (): JSX.Element => (
      <div class={styles.quillContainer} style={{ height: `${props.height}px` }}>
        <Toolbar
          editor={editorRef.value}
          defaultConfig={toolbarConfig.value}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
        <Editor
          defaultConfig={editorConfig.value}
          mode="default"
          modelValue={valueHtml.value}
          style={{ height: `${(props.height ?? 350) - 42}px`, overflowY: 'hidden' }}
          onOnCreated={handleCreated}
          onOnChange={handleChange}
          class={styles.editorContainer}
        />
      </div>
    )
  }
})
