export const schema = {
  name: "CategoryTabs",
  title: "分类标签页",
  description: "通用分类筛选Tab组件，支持链接跳转或按钮模式",
  interactive: true,
  props: {
    categories: {
      type: "array" as const,
      required: true,
      label: "分类列表",
      description: "请在此配置分类列表，每项包含ID、名称、图标和链接",
      itemType: {
        id: { type: "string" as const, required: true, label: "ID" },
        name: { type: "string" as const, required: true, label: "名称" },
        icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const },
        href: { type: "string" as const, required: false, label: "链接" },
      },
      defaultValue: [
        { id: "all", name: "全部", href: "#" },
        { id: "cat-1", name: "分类一", href: "#" },
        { id: "cat-2", name: "分类二", href: "#" },
        { id: "cat-3", name: "分类三", href: "#" },
      ],
    },
    activeId: { type: "string" as const, required: false, defaultValue: "all", label: "当前选中分类ID" },
    allText: { type: "string" as const, required: false, defaultValue: "全部", label: "全部分类文案" },
    allHref: { type: "string" as const, required: false, label: "全部分类链接地址" },
    urlAware: { type: "boolean" as const, required: false, defaultValue: false, label: "根据URL动态高亮" },
    wrapMobile: { type: "boolean" as const, required: false, defaultValue: false, label: "移动端是否换行" },
  },
} as const;
