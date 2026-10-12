export const schema = {
  name: "CaseVideoShowcase",
  title: "案例视频展示",
  description: "全宽视频展示组件，支持静音自动播放和点击有声重播",
  interactive: true,
  props: {
    title: { type: "string" as const, required: false, label: "标题", defaultValue: "案例视频展示" },
    subtitle: { type: "string" as const, required: false, label: "副标题", defaultValue: "观看客户真实使用场景" },
    videoUrl: {
      type: "string" as const,
      required: true,
      label: "视频地址",
      editor: "image" as const,
      defaultValue: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    },
    thumbnail: {
      type: "string" as const,
      required: false,
      label: "缩略图",
      editor: "image" as const,
      defaultValue: "https://placehold.co/1280x720/0ea5e9/ffffff?text=Thumbnail",
    },
    duration: { type: "string" as const, required: false, label: "视频时长", defaultValue: "03:24" },
    playButtonText: { type: "string" as const, required: false, label: "播放按钮文本", defaultValue: "播放视频" },
    backgroundImage: {
      type: "string" as const,
      required: false,
      label: "背景图片",
      editor: "image" as const,
      defaultValue: "https://placehold.co/1600x900/6366f1/ffffff?text=Background",
    },
  },
} as const;
