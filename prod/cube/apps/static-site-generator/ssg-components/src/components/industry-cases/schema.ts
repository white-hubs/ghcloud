export const schema = {
  name: "IndustryCases",
  title: "行业案例网格",
  description: "带分类筛选的行业案例卡片展示，支持客户端切换分类",
  interactive: true,
  props: {
    cases: {
      type: "array" as const,
      required: true,
      label: "案例列表",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        category: { type: "string" as const, required: true, label: "分类" },
        description: { type: "string" as const, required: true, label: "描述", editor: "textarea" as const },
        href: { type: "string" as const, required: false, label: "链接" },
        video: { type: "string" as const, required: false, label: "视频", editor: "image" as const },
      },
      defaultValue: [
        {
          image: "https://placehold.co/640x400/0ea5e9/ffffff?text=Industry+1",
          title: "示例行业案例一",
          category: "manufacturing",
          description: "制造业数字化示例项目，展示卡片排版与描述长度效果。",
          href: "#",
        },
        {
          image: "https://placehold.co/640x400/6366f1/ffffff?text=Industry+2",
          title: "示例行业案例二",
          category: "energy",
          description: "能源行业智能化升级示例项目，用于设计器预览。",
          href: "#",
        },
      ],
    },
  },
} as const;
