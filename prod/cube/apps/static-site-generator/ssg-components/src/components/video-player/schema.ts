export const schema = {
  name: "VideoPlayer",
  title: "视频播放器",
  description: "自定义视频播放器组件",
  interactive: true,
  props: {
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
      defaultValue: "https://placehold.co/1280x720/0ea5e9/ffffff?text=Video",
    },
    poster: {
      type: "string" as const,
      required: false,
      label: "封面图",
      editor: "image" as const,
      defaultValue: "https://placehold.co/1280x720/6366f1/ffffff?text=Poster",
    },
  },
} as const;
