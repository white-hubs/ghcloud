export const schema = {
  name: "ApplicationScene",
  title: "应用场景",
  description: "带顶部 tab 切换与左右分栏图片展示的应用场景组件，支持 PC 端与移动端自动轮播",
  interactive: true,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "应用场景", description: "组件主标题" },
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
    autoPlay: { type: "boolean" as const, required: false, label: "自动轮播", defaultValue: true, description: "是否自动轮播场景" },
    autoPlayInterval: {
      type: "number" as const,
      required: false,
      label: "轮播间隔",
      defaultValue: 3000,
      description: "自动轮播间隔时间（毫秒）",
    },
    items: {
      type: "array" as const,
      required: true,
      label: "场景列表",
      description: "应用场景数据数组",
      itemType: {
        label: { type: "string" as const, required: true, label: "标签" },
        content: { type: "string" as const, required: true, label: "内容", editor: "textarea" as const },
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
      },
      defaultValue: [
        {
          label: "场景一",
          content: "示例场景描述一，用于展示左右分栏排版效果。",
          image: "https://placehold.co/800x500/0ea5e9/ffffff?text=Scene+1",
        },
        {
          label: "场景二",
          content: "示例场景描述二，用于展示 tab 切换效果。",
          image: "https://placehold.co/800x500/6366f1/ffffff?text=Scene+2",
        },
      ],
    },
  },
} as const;
