export const schema = {
  name: 'ProductApplication',
  title: '产品应用',
  description: '产品应用场景4列网格展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '产品应用' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    items: {
      type: 'array' as const,
      required: true,
      label: '应用列表',
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
      },
      defaultValue: [
        { image: 'https://placehold.co/600x376/e2e8f0/0f172a?text=Application+1', title: '应用场景一' },
        { image: 'https://placehold.co/600x376/cbd5e1/0f172a?text=Application+2', title: '应用场景二' },
        { image: 'https://placehold.co/600x376/94a3b8/ffffff?text=Application+3', title: '应用场景三' },
        { image: 'https://placehold.co/600x376/64748b/ffffff?text=Application+4', title: '应用场景四' },
      ],
    },
  },
} as const
