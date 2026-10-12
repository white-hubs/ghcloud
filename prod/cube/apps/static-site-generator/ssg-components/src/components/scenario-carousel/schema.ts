export const schema = {
  name: "ScenarioCarousel",
  title: "应用场景轮播",
  description: "一行显示4个场景卡片的轮播组件，支持左右切换和自动轮播",
  interactive: true,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "应用场景", description: "组件标题" },
    scenarios: {
      type: "array" as const,
      required: true,
      label: "场景列表",
      description: "应用场景数据数组",
      itemType: {
        image: { type: "string" as const, required: true, label: "场景图片", editor: "image" as const },
        title: { type: "string" as const, required: true, label: "场景标题" },
      },
      defaultValue: [
        { image: "https://placehold.co/640x400/0ea5e9/ffffff?text=Scene+1", title: "场景一" },
        { image: "https://placehold.co/640x400/6366f1/ffffff?text=Scene+2", title: "场景二" },
        { image: "https://placehold.co/640x400/22c55e/ffffff?text=Scene+3", title: "场景三" },
        { image: "https://placehold.co/640x400/f97316/ffffff?text=Scene+4", title: "场景四" },
      ],
    },
    showArrows: {
      type: "boolean" as const,
      required: false,
      label: "显示箭头",
      defaultValue: false,
      description: "是否显示左右切换箭头（默认使用指示器切换）",
    },
    showDots: { type: "boolean" as const, required: false, label: "显示指示器", defaultValue: true, description: "是否显示底部指示点" },
    backgroundImage: {
      type: "string" as const,
      required: false,
      label: "背景图",
      defaultValue: "https://qiniu.guhecloud.com/imgs/pages/twin/math-background.png",
      description: "组件背景图URL",
      editor: "image" as const,
    },
    autoPlay: { type: "boolean" as const, required: false, label: "自动轮播", defaultValue: true, description: "是否自动轮播" },
    autoPlayInterval: {
      type: "number" as const,
      required: false,
      label: "轮播间隔",
      defaultValue: 3000,
      description: "自动轮播间隔时间（毫秒）",
    },
  },
} as const;
