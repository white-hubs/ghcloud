export const schema = {
  name: "CaseShowcase",
  title: "案例展示",
  description: "横向滚动案例卡片展示，支持hover展开动效",
  interactive: true,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "精选案例" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "覆盖多行业的标杆落地实践" },
    showIndicators: { type: "boolean" as const, required: false, label: "显示轮播指示器", defaultValue: false },
    viewMoreLink: { type: "string" as const, required: false, label: "查看更多链接", defaultValue: "#" },
    viewMoreText: { type: "string" as const, required: false, label: "查看更多文字", defaultValue: "查看更多" },
    cases: {
      type: "array" as const,
      required: true,
      label: "案例数组",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        subtitle: { type: "string" as const, required: false, label: "副标题" },
        href: { type: "string" as const, required: false, label: "链接" },
      },
      defaultValue: [
        { image: "https://placehold.co/720x440/0ea5e9/ffffff?text=Case+1", title: "示例案例一", subtitle: "行业标杆项目", href: "#" },
        { image: "https://placehold.co/720x440/6366f1/ffffff?text=Case+2", title: "示例案例二", subtitle: "数字化转型实践", href: "#" },
        { image: "https://placehold.co/720x440/22c55e/ffffff?text=Case+3", title: "示例案例三", subtitle: "智能化升级方案", href: "#" },
      ],
    },
  },
} as const;
