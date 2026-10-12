export const schema = {
  name: "FloatingSidebar",
  title: "悬浮侧边栏",
  description: "页面右侧悬浮功能侧边栏",
  interactive: true,
  props: {
    items: {
      type: "array" as const,
      required: true,
      label: "侧边栏项",
      defaultValue: [
        {
          name: "电话咨询",
          icon: "phone",
          content: "400-000-0000",
          linkUrl: "tel:4000000000",
        },
        {
          name: "在线咨询",
          icon: "message",
          content: "咨",
          linkUrl: "/consultation.html",
        },
        {
          name: "公众号",
          icon: "wechat",
          img: "https://placehold.co/240x240/ffffff/1578FF?text=QR",
        },
      ],
      itemType: {
        name: { type: "string" as const, required: false, label: "名称" },
        icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const, description: "支持内置图标（phone/message/wechat）或上传 SVG" },
        content: { type: "string" as const, required: false, label: "内容" },
        img: { type: "string" as const, required: false, label: "图片", editor: "image" as const },
        linkUrl: { type: "string" as const, required: false, label: "链接" },
      },
    },
  },
} as const;
