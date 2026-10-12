import { authStore } from '@/api/auth-store'
import {
  defineComponent,
  onMounted,
  ref,
  type PropType,
  watch,
} from 'vue'
import E from 'wangeditor'
import styles from './edit.module.less'

interface EditorProps {
  id?: string;
  height?: number;
  zIndex?: number;
  text?: string;
  max?: number;
  businessKey?: string;
  placeholder?: string;
}

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
    businessKey: {
      type: String as PropType<string>,
      default: 'ouaa'
    },
    placeholder: {
      type: String as PropType<string>,
      default: '请填写公告内容'
    }
  },
  emits: ['getHtml'],
  setup: (props: EditorProps, { emit }) => {
    const editorRef = ref<HTMLElement>()

    let editor: E | null = null
    const initEditor = async (): Promise<void> => {
      if (!editorRef.value) return


      editor = new E(editorRef.value)
      if (!editor) return
      editor.config.height = props.height || 350
      editor.config.zIndex = props.zIndex || 2
      editor.config.menus = [
        'head', 'bold', 'fontSize', 'fontName', 'italic', 'underline',
        'strikeThrough', 'foreColor', 'backColor', 'link', 'list',
        'justify', 'quote', 'emoticon', 'image', 'table', 'code',
        'undo', 'redo', 'indent', 'lineHeight', 'splitLine'
      ]

      // 图片上传配置
      editor.config.uploadImgServer = '/api/file/file'
      editor.config.uploadImgAccept = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      if (props.max) {
        editor.config.uploadImgMaxLength = props.max
      }
      editor.config.uploadFileName = 'file'
      if (props.placeholder) {
        editor.config.placeholder = props.placeholder
      }

      editor.config.uploadImgParams = {
        tenant: authStore.tenant,
        businessKey: props.businessKey || 'ouaa'
      }

      editor.config.uploadImgHeaders = {
        Authorization: `Bearer ${authStore.token}`,
        tenant: authStore.tenant,
        terminal: 'bimops-manage-web'
      }

      editor.config.uploadImgHooks = {
        timeout: (): void => {
        },
        customInsert: (insertImgFn, result): void => {
          // @ts-ignore
          result.data?.path && insertImgFn(result.data.path)
        }
      }

      editor.config.onchange = (html: string): void => {
        emit('getHtml', html)
      }


      editor.create()

      editor.txt.html(props.text)
    }
    watch(() => props.text, (newVal) => {

      editor?.txt.html(newVal || '')
    })

    onMounted(() => {
      initEditor()
    })
    return (): JSX.Element => (
      <div>
        <div ref={editorRef} id={styles[`editor${props.id}`]} />
      </div>
    )
  }
})
