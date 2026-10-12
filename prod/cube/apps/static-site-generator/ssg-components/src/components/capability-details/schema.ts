export const schema = {
  name: "CapabilityDetails",
  title: "应用场景详情",
  description: "左右交替布局的能力/场景图文展示",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "能力详情" },
    items: {
      type: "array" as const,
      required: true,
      label: "能力列表",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        subtitle: { type: "string" as const, required: false, label: "副标题" },
        features: {
          type: "array" as const,
          required: true,
          label: "特性列表",
          defaultValue: [],
          itemType: {
            label: { type: "string" as const, required: true, label: "标签" },
            value: { type: "string" as const, required: true, label: "值" },
          },
        },
      },
      defaultValue: [
        {
          image: "https://placehold.co/720x440/0ea5e9/ffffff?text=Capability+1",
          title: "能力一",
          subtitle: "核心场景示例",
          features: [
            { label: "核心指标", value: "99.9%" },
            { label: "响应速度", value: "<200ms" },
          ],
        },
        {
          image: "https://placehold.co/720x440/6366f1/ffffff?text=Capability+2",
          title: "能力二",
          subtitle: "行业落地实践",
          features: [
            { label: "覆盖行业", value: "10+" },
            { label: "客户规模", value: "500+" },
          ],
        },
      ],
    },
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
    sectionId: { type: "string" as const, required: false, label: "锚点ID", defaultValue: "capability-details" },
  },
} as const;
