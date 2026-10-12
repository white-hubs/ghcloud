export const schema = {
  name: "PainPoints",
  title: "业务痛点",
  description: "业务痛点 4 列图标卡片展示",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "业务痛点" },
    items: {
      type: "array" as const,
      required: true,
      label: "痛点列表",
      itemType: {
        icon: { type: "string" as const, required: true, label: "图标", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        description: { type: "string" as const, required: true, label: "描述" },
      },
      defaultValue: [
        { icon: "https://placehold.co/96x96/eef2f8/333?text=1", title: "痛点一", description: "示例痛点描述文案一。" },
        { icon: "https://placehold.co/96x96/eef2f8/333?text=2", title: "痛点二", description: "示例痛点描述文案二。" },
        { icon: "https://placehold.co/96x96/eef2f8/333?text=3", title: "痛点三", description: "示例痛点描述文案三。" },
        { icon: "https://placehold.co/96x96/eef2f8/333?text=4", title: "痛点四", description: "示例痛点描述文案四。" },
      ],
    },
    backgroundColor: { type: "string" as const, required: false, label: "背景色", defaultValue: "#ebf2ff", editor: "color" as const },
    sectionId: { type: "string" as const, required: false, label: "锚点ID", defaultValue: "" },
  },
} as const;
