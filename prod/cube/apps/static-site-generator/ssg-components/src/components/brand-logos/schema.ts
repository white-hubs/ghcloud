export const schema = {
  name: "BrandLogos",
  title: "合作品牌",
  description: "展示品牌合作伙伴 Logo 列表",
  interactive: false,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "合作品牌" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "展示品牌合作伙伴 Logo 的默认示例内容。" },
    backgroundColor: { type: "string" as const, required: false, label: "背景色", defaultValue: "#ffffff", editor: "color" as const },
    logos: {
      type: "array" as const,
      required: true,
      label: "Logo列表",
      defaultValue: [
        { image: "https://placehold.co/240x120/ffffff/1578FF?text=LOGO+1", name: "品牌一", href: "#" },
        { image: "https://placehold.co/240x120/ffffff/0F172A?text=LOGO+2", name: "品牌二", href: "#" },
        { image: "https://placehold.co/240x120/ffffff/334155?text=LOGO+3", name: "品牌三", href: "#" },
        { image: "https://placehold.co/240x120/ffffff/475569?text=LOGO+4", name: "品牌四", href: "#" },
      ],
      itemType: {
        image: { type: "string" as const, required: true, label: "图片", editor: "image" as const },
        name: { type: "string" as const, required: false, label: "名称" },
        href: { type: "string" as const, required: false, label: "链接" },
      },
    },
  },
} as const;
