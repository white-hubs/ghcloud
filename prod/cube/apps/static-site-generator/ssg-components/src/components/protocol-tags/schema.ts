export const schema = {
  name: "ProtocolTags",
  title: "协议标签",
  description: "协议/能力标签网格展示",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "协议与标准" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "支持主流协议，兼容通用标准" },
    tags: {
      type: "array" as const,
      required: true,
      label: "协议列表",
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        name: { type: "string" as const, required: true, label: "名称" },
      },
      defaultValue: [
        { image: "https://placehold.co/80x80/0ea5e9/ffffff?text=P1", name: "协议A" },
        { image: "https://placehold.co/80x80/6366f1/ffffff?text=P2", name: "协议B" },
        { image: "https://placehold.co/80x80/22c55e/ffffff?text=P3", name: "协议C" },
        { image: "https://placehold.co/80x80/f97316/ffffff?text=P4", name: "协议D" },
      ],
    },
    backgroundColor: { type: "string" as const, required: false, label: "背景色", defaultValue: "#ebf2ff", editor: "color" as const },
  },
} as const;
