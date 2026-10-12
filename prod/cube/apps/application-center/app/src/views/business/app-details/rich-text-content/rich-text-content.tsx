import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './rich-text-content.module.less'

export interface RichTextContentProps {
  content: string;
  title?: string;
}

export const RichTextContent = defineComponent({
  props: {
    content: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },

  setup (props) {
    const processedContent = ref('')

    /**
     * 根据text-align值获取对应的justify-content值
     */
    const getJustifyContent = (alignment: string): string => {
      switch (alignment.toLowerCase()) {
        case 'center':
          return 'center'
        case 'right':
          return 'flex-end'
        case 'left':
        default:
          return 'flex-start'
      }
    }

    /**
     * 处理带有text-align的标签，统一设置为flex布局
     */
    const processTextAlignElements = (html: string): string => {
      if (!html) {
        return html
      }

      // 处理所有带有text-align样式的标签
      return html.replace(
        /<(\w+)([^>]*?)style="([^"]*?)text-align:\s*(center|left|right)([^"]*?)"([^>]*?)>/gi,
        (match, tagName, beforeStyle, beforeAlign, alignment, afterAlign, afterAttrs) => {
          const justifyContent = getJustifyContent(alignment)

          // 构建新的样式，移除原有的text-align，添加flex布局
          let newStyle = beforeAlign + afterAlign

          // 移除可能存在的display属性
          newStyle = newStyle.replace(/display:\s*[^;]+;?/gi, '')

          // 添加flex布局样式
          const flexStyle = `display: flex; justify-content: ${justifyContent}; flex-wrap: wrap; gap: 10px;`

          // 清理样式字符串，移除多余的分号
          newStyle = newStyle.replace(/;\s*;/g, ';').replace(/^;|;$/g, '')

          // 组合最终样式
          const finalStyle = newStyle ? `${flexStyle} ${newStyle}` : flexStyle

          return `<${tagName}${beforeStyle}style="${finalStyle}"${afterAttrs}>`
        }
      )
    }

    /**
     * 更新处理后的内容
     */
    const updateProcessedContent = (): void => {
      processedContent.value = processTextAlignElements(props.content)
    }

    // 监听content变化
    watch(() => props.content, updateProcessedContent, { immediate: true })

    onMounted(() => {
      updateProcessedContent()
    })

    return (): JSX.Element => (
      <div class={styles['rich-text-content']}>
        {props.title && (
          <h2 class={styles['section-title']}>{props.title}</h2>
        )}
        <div
          class={styles['content']}
          innerHTML={processedContent.value}
        />
      </div>
    )
  }
})