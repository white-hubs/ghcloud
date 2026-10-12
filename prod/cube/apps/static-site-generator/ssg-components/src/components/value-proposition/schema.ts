export const schema = {
  name: "ValueProposition",
  title: "价值主张",
  description: "2x2网格展示产品价值点",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "核心价值主张" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "为客户带来稳定可靠的数字化体验" },
    backgroundColor: { type: "string" as const, required: false, label: "背景色", defaultValue: "#f5f7fa", editor: "color" as const },
    items: {
      type: "array" as const,
      required: true,
      label: "价值主张数组",
      itemType: {
        icon: { type: "string" as const, required: true, label: "图标", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "标题" },
        description: { type: "string" as const, required: true, label: "描述", editor: "textarea" as const },
      },
      defaultValue: [
        { icon: "https://placehold.co/96x96/0ea5e9/ffffff?text=01", title: "高效交付", description: "以成熟工程化流程快速交付稳定产品。" },
        { icon: "https://placehold.co/96x96/0ea5e9/ffffff?text=02", title: "稳定可靠", description: "完备测试链路与监控能力保障业务持续稳定。" },
        { icon: "https://placehold.co/96x96/0ea5e9/ffffff?text=03", title: "开放生态", description: "丰富的能力接口与合作伙伴共建生态。" },
        { icon: "https://placehold.co/96x96/0ea5e9/ffffff?text=04", title: "贴身服务", description: "全流程响应机制，专业团队贴身支持。" },
      ],
    },
    sectionId: { type: "string" as const, required: false, label: "锚点ID", defaultValue: "value-proposition" },
  },
} as const;
