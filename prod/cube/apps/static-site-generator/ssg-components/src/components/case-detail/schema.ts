export const schema = {
  name: "CaseDetail",
  title: "案例详情",
  description: "案例详情页内容展示，含概况、痛点、价值、相关案例",
  interactive: true,
  props: {
    breadcrumbs: {
      type: "array" as const,
      required: false,
      label: "面包屑导航",
      itemType: {
        name: { type: "string" as const, required: true, label: "名称" },
        href: { type: "string" as const, required: false, label: "链接" },
      },
      defaultValue: [{ name: "首页", href: "/" }, { name: "案例中心", href: "/cases.html" }, { name: "案例详情" }],
    },
    overviewTitle: { type: "string" as const, required: false, defaultValue: "建设概况", label: "建设概况标题" },
    overviewDescription: {
      type: "string" as const,
      required: false,
      label: "建设概况描述",
      defaultValue: "这是示例建设概况描述文案，用于展示段落排版与视觉效果，可在右侧面板替换为真实内容。",
    },
    overviewImage: {
      type: "string" as const,
      required: false,
      label: "建设概况图片",
      defaultValue: "https://placehold.co/960x540/0ea5e9/ffffff?text=Overview",
    },
    overviewVideo: { type: "string" as const, required: false, label: "建设概况视频地址", editor: "image" as const, defaultValue: "" },
    painPointsTitle: { type: "string" as const, required: false, defaultValue: "项目痛点", label: "项目痛点标题" },
    painPointsDescription: {
      type: "string" as const,
      required: false,
      label: "项目痛点描述",
      defaultValue: "这是示例项目痛点描述文案，列出关键难点，帮助设计器预览段落排版。",
    },
    valueTitle: { type: "string" as const, required: false, defaultValue: "建设价值", label: "建设价值标题" },
    valueDescription: {
      type: "string" as const,
      required: false,
      label: "建设价值描述",
      defaultValue: "这是示例建设价值描述文案，概述方案带来的业务价值与技术价值。",
    },
    relatedCasesTitle: { type: "string" as const, required: false, defaultValue: "相关案例", label: "相关案例标题" },
    relatedCases: {
      type: "array" as const,
      required: false,
      label: "相关案例列表",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        href: { type: "string" as const, required: false, label: "链接" },
      },
      defaultValue: [
        { image: "https://placehold.co/480x320/0ea5e9/ffffff?text=Related+1", title: "相关案例一", href: "#" },
        { image: "https://placehold.co/480x320/6366f1/ffffff?text=Related+2", title: "相关案例二", href: "#" },
      ],
    },
  },
} as const;
