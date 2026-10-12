export const schema = {
  name: "SupportingProducts",
  title: "配套产品",
  description: "配套产品展示组件，双卡片布局（硬件产品+应用中心）",
  interactive: false,
  props: {
    title: {
      type: "string" as const,
      required: false,
      defaultValue: "配套产品",
      label: "标题",
    },
    backgroundImage: {
      type: "string" as const,
      required: false,
      defaultValue: "",
      label: "默认背景图片",
      editor: "image" as const,
    },
    cards: {
      type: "array" as const,
      required: true,
      label: "卡片列表",
      defaultValue: [
        {
          cardTitle: "硬件产品",
          cardUrl: "/hardware.html",
          backgroundImage: "",
          items: [],
        },
        {
          cardTitle: "应用中心",
          cardUrl: "/apps.html",
          backgroundImage: "",
          items: [],
        },
      ],
      itemType: {
        cardTitle: { type: "string" as const, required: true, label: "卡片标题" },
        cardUrl: { type: "string" as const, required: false, label: "卡片链接" },
        backgroundImage: { type: "string" as const, required: false, label: "背景图片", editor: "image" as const },
        items: {
          type: "array" as const,
          required: true,
          label: "产品列表",
          defaultValue: [],
          itemType: {
            name: { type: "string" as const, required: true, label: "名称" },
            href: { type: "string" as const, required: false, label: "链接" },
          },
        },
      },
    },
    theme: {
      type: "string" as const,
      required: false,
      defaultValue: "light",
      label: "主题",
      editor: "select" as const,
      options: [
        { label: "浅色", value: "light" },
        { label: "深色", value: "dark" },
      ] as const,
    },
    sectionId: { type: "string" as const, required: false, label: "锚点ID" },
  },
} as const;
