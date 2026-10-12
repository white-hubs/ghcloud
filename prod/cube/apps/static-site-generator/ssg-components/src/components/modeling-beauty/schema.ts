export const schema = {
  name: 'ModelingBeauty',
  title: '模型美化展示',
  description: '建模服务页面模型美化区块，上下排列展示多张对比图片',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '区块标题', defaultValue: '模型美化展示' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    images: {
      type: 'array' as const,
      required: true,
      label: '图片列表',
      defaultValue: [
        'https://placehold.co/1440x800/e2e8f0/0f172a?text=Modeling+Beauty+1',
        'https://placehold.co/1440x800/cbd5e1/0f172a?text=Modeling+Beauty+2',
      ],
      itemType: 'string',
    },
  },
} as const
