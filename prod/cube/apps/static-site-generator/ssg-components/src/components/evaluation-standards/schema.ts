export const schema = {
  name: 'EvaluationStandards',
  title: '考核标准',
  description: '考核标准卡片网格，带序号和背景图',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '考核标准' },
    items: {
      type: 'array' as const,
      required: true,
      label: '标准列表',
      itemType: {
        number: { type: 'string' as const, required: true, label: '序号' },
        description: { type: 'string' as const, required: true, label: '描述' },
        image: { type: 'string' as const, required: true, label: '背景图', editor: 'image' as const },
      },
      defaultValue: [
        { number: '01', description: '标准描述一', image: 'https://placehold.co/646x218/0ea5e9/ffffff?text=1' },
        { number: '02', description: '标准描述二', image: 'https://placehold.co/646x218/6366f1/ffffff?text=2' },
      ],
    },
  },
} as const
