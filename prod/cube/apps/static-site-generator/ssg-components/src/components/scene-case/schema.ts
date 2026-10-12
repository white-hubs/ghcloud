export const schema = {
  name: 'SceneCase',
  title: '场景案例',
  description: '场景案例还原展示，支持主图+多图列表',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '场景案例' },
    image: { type: 'string' as const, required: false, label: '场景还原图片', editor: 'image' as const, defaultValue: '' },
    items: {
      type: 'array' as const,
      required: false,
      label: '场景图片列表',
      defaultValue: [],
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        label: { type: 'string' as const, required: false, label: '标签' },
      },
    },
  },
} as const
