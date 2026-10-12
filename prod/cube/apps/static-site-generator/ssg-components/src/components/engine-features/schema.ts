export const schema = {
  name: 'EngineFeatures',
  title: '引擎特点',
  description: '带图片的引擎/平台特性网格展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '引擎特点' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '多维能力一体化交付' },
    bgColor: { type: 'string' as const, required: false, label: '背景颜色', defaultValue: '#ffffff' },
    items: {
      type: 'array' as const,
      required: true,
      label: '特性列表',
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
        description: { type: 'string' as const, required: false, label: '描述' },
      },
      defaultValue: [
        { image: 'https://placehold.co/480x320/0ea5e9/ffffff?text=Feature+1', title: '特性一', description: '示例特性描述一，帮助展示排版效果。' },
        { image: 'https://placehold.co/480x320/6366f1/ffffff?text=Feature+2', title: '特性二', description: '示例特性描述二，帮助展示排版效果。' },
      ],
    },
    sectionId: { type: 'string' as const, required: false, label: '锚点ID', defaultValue: 'engine-features' },
  },
} as const
