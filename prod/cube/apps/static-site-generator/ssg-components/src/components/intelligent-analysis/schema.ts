export const schema = {
  name: "IntelligentAnalysis",
  title: "智能分析",
  description: "智能分析能力展示，支持多种图文布局",
  interactive: false,
  props: {
    sectionTitle: { type: "string" as const, required: true, label: "区域标题", defaultValue: "智能分析" },
    groups: {
      type: "array" as const,
      required: true,
      label: "分组列表",
      defaultValue: [
        {
          title: "分析分组示例",
          subtitle: "用于设计器预览的默认分组",
          layout: "grid",
          columns: 2,
          items: [
            {
              image: "https://placehold.co/820x576/0f172a/ffffff?text=Analysis+1",
              title: "分析卡片一",
              subtitle: "默认说明文案",
            },
            {
              image: "https://placehold.co/820x576/334155/ffffff?text=Analysis+2",
              title: "分析卡片二",
              subtitle: "默认说明文案",
            },
          ],
        },
      ],
      itemType: {
        title: { type: "string" as const, required: false, label: "分组标题" },
        subtitle: { type: "string" as const, required: false, label: "分组副标题" },
        layout: { type: "string" as const, required: true, label: "布局类型(grid/horizontal/vertical/slogan)" },
        columns: { type: "number" as const, required: false, label: "Grid列数" },
        items: {
          type: "array" as const,
          required: false,
          label: "图片卡片",
          defaultValue: [],
          itemType: {
            image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
            title: { type: "string" as const, required: false, label: "一级标题" },
            subtitle: { type: "string" as const, required: false, label: "二级标题" },
          },
        },
        slogans: { type: "array" as const, required: false, label: "标语列表", defaultValue: [] },
      },
    },
  },
} as const;
