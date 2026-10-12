export const schema = {
  name: 'ModelTransform',
  title: '模型转化',
  description: '模型转化流程图文展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '模型转化流程' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '从模型到落地的关键路径' },
    image: {
      type: 'string' as const,
      required: true,
      label: '图片',
      defaultValue: 'https://placehold.co/1200x600/0ea5e9/ffffff?text=Model+Transform',
    },
  },
} as const
