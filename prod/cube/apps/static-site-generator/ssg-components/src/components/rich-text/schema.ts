export const schema = {
  name: "RichText",
  title: "富文本内容",
  description: "HTML富文本内容展示块",
  interactive: false,
  props: {
    content: {
      type: "string" as const,
      required: true,
      label: "HTML内容",
      defaultValue: "<h3>示例标题</h3><p>这是一段富文本示例内容，用于设计器预览。可在右侧面板粘贴真实 HTML 进行替换。</p>",
    },
    background: { type: "string" as const, required: false, label: "背景色", defaultValue: "white", editor: "color" as const },
  },
} as const;
