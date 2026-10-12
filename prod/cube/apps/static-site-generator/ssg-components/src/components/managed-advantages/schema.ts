export const schema = {
  name: 'ManagedAdvantages',
  title: '托管服务优势',
  description: '服务优势图片+标题卡片展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '区块标题', defaultValue: '托管服务优势' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    items: {
      type: 'array' as const,
      required: true,
      label: '优势列表',
      defaultValue: [
        { image: 'https://placehold.co/500x320/e2e8f0/0f172a?text=Advantage+1', title: '优势一' },
        { image: 'https://placehold.co/500x320/cbd5e1/0f172a?text=Advantage+2', title: '优势二' },
        { image: 'https://placehold.co/500x320/94a3b8/ffffff?text=Advantage+3', title: '优势三' },
        { image: 'https://placehold.co/500x320/64748b/ffffff?text=Advantage+4', title: '优势四' },
      ],
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
      },
    },
  },
} as const
