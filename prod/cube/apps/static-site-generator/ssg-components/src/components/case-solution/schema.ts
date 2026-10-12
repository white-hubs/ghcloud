export const schema = {
  name: "CaseSolution",
  title: "客户案例",
  description: "客户案例 3 列图片卡片展示",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "客户案例" },
    cases: {
      type: "array" as const,
      required: true,
      label: "案例列表",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        href: { type: "string" as const, required: false, label: "链接" },
      },
      defaultValue: [
        { image: "https://placehold.co/400x225/f5f5f5/333?text=Case+1", title: "案例一", href: "#" },
        { image: "https://placehold.co/400x225/f5f5f5/333?text=Case+2", title: "案例二", href: "#" },
        { image: "https://placehold.co/400x225/f5f5f5/333?text=Case+3", title: "案例三", href: "#" },
      ],
    },
    viewMoreLink: { type: "string" as const, required: false, label: "查看更多链接", defaultValue: "" },
    viewMoreText: { type: "string" as const, required: false, label: "查看更多文案", defaultValue: "查看更多" },
    theme: {
      type: "string" as const,
      required: false,
      label: "主题",
      defaultValue: "light",
      editor: "select" as const,
      options: [
        { label: "浅色", value: "light" },
        { label: "深色", value: "dark" },
      ] as const,
    },
    sectionId: { type: "string" as const, required: false, label: "锚点ID", defaultValue: "" },
  },
} as const;
