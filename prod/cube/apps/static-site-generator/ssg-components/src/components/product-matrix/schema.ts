export const schema = {
  name: "ProductMatrix",
  title: "产品矩阵",
  description: "三列产品分类矩阵展示（软件+硬件+服务）",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "产品矩阵" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "软件、硬件与服务一体化解决方案" },
    softwareCategory: {
      type: "object" as const,
      required: false,
      label: "软件产品分类",
      itemType: {
        name: { type: "string" as const, required: true, label: "分类名称" },
        items: {
          type: "array" as const,
          required: true,
          label: "产品列表",
          defaultValue: [],
          itemType: {
            name: { type: "string" as const, required: true, label: "产品名称" },
            icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const },
            href: { type: "string" as const, required: false, label: "链接地址" },
          },
        },
      },
      defaultValue: {
        name: "软件产品",
        items: [
          { name: "软件产品一", icon: "https://placehold.co/64x64/0ea5e9/ffffff?text=S1" },
          { name: "软件产品二", icon: "https://placehold.co/64x64/0ea5e9/ffffff?text=S2" },
        ],
      },
    },
    hardwareCategory: {
      type: "object" as const,
      required: false,
      label: "硬件产品分类",
      itemType: {
        name: { type: "string" as const, required: true, label: "分类名称" },
        items: {
          type: "array" as const,
          required: true,
          label: "产品列表",
          defaultValue: [],
          itemType: {
            name: { type: "string" as const, required: true, label: "产品名称" },
            icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const },
            href: { type: "string" as const, required: false, label: "链接地址" },
          },
        },
      },
      defaultValue: {
        name: "硬件产品",
        items: [
          { name: "硬件产品一", icon: "https://placehold.co/64x64/6366f1/ffffff?text=H1" },
          { name: "硬件产品二", icon: "https://placehold.co/64x64/6366f1/ffffff?text=H2" },
        ],
      },
    },
    serviceCategory: {
      type: "object" as const,
      required: false,
      label: "服务产品分类",
      itemType: {
        name: { type: "string" as const, required: true, label: "分类名称" },
        items: {
          type: "array" as const,
          required: true,
          label: "产品列表",
          defaultValue: [],
          itemType: {
            name: { type: "string" as const, required: true, label: "产品名称" },
            icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const },
            href: { type: "string" as const, required: false, label: "链接地址" },
          },
        },
      },
      defaultValue: {
        name: "服务产品",
        items: [
          { name: "服务产品一", icon: "https://placehold.co/64x64/22c55e/ffffff?text=V1" },
          { name: "服务产品二", icon: "https://placehold.co/64x64/22c55e/ffffff?text=V2" },
        ],
      },
    },
  },
} as const;
