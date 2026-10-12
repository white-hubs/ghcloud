export const schema = {
  name: "SwiperCarousel",
  title: "轮播图",
  description: "全屏Banner轮播组件，支持标题、按钮和自动播放",
  interactive: true,
  props: {
    items: {
      type: "array" as const,
      required: true,
      label: "轮播项",
      defaultValue: [
        {
          image: "https://placehold.co/1920x720/0f172a/ffffff?text=Banner+Preview",
          badge: "默认轮播",
          title: "默认轮播标题",
          subtitle: "这里是默认副标题，便于在设计器中直接预览版式效果",
          description: "如果未手动配置轮播项，页面设计器会先使用这条默认数据进行展示。",
          primaryButton: {
            text: "了解更多",
            link: "#",
            color: "#1578FF",
          },
          titleColor: "#FFFFFF",
          subtitleColor: "rgba(255, 255, 255, 0.92)",
          theme: "dark",
        },
      ],
      itemType: {
        image: { type: "string" as const, required: true, label: "背景图片", editor: "image" as const },
        badge: { type: "string" as const, required: false, label: "角标文字" },
        title: { type: "string" as const, required: false, label: "主标题" },
        subtitle: { type: "string" as const, required: false, label: "副标题" },
        description: { type: "string" as const, required: false, label: "描述文本", editor: "textarea" as const },
        link: { type: "string" as const, required: false, label: "整体跳转链接" },
        titleColor: { type: "string" as const, required: false, label: "标题颜色", editor: "color" as const },
        subtitleColor: { type: "string" as const, required: false, label: "副标题颜色", editor: "color" as const },
        theme: {
          type: "string" as const,
          required: false,
          label: "主题",
          editor: "select" as const,
          options: [
            { label: "浅色", value: "light" },
            { label: "深色", value: "dark" },
          ] as const,
        },
        primaryButton: {
          type: "object" as const,
          required: false,
          label: "主按钮",
          defaultValue: { text: "了解更多", link: "#", color: "#1578FF" },
          itemType: {
            text: { type: "string" as const, required: true, label: "按钮文字" },
            link: { type: "string" as const, required: true, label: "跳转链接" },
            color: { type: "string" as const, required: false, label: "按钮颜色", editor: "color" as const },
          },
        },
        secondaryButton: {
          type: "object" as const,
          required: false,
          label: "次按钮",
          defaultValue: { text: "", link: "", color: "#FFFFFF" },
          itemType: {
            text: { type: "string" as const, required: true, label: "按钮文字" },
            link: { type: "string" as const, required: true, label: "跳转链接" },
            color: { type: "string" as const, required: false, label: "按钮颜色", editor: "color" as const },
          },
        },
      },
    },
  },
} as const;
