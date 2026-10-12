export const schema = {
  name: 'SolutionDesign',
  title: '概要设计',
  description: '带左侧图片与右侧交互列表的概要设计展示组件，支持 PC hover 切换与移动端 tab 切换',
  interactive: true,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '概要设计', description: '组件主标题' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '', description: '组件副标题/描述文本' },
    items: {
      type: 'array' as const,
      required: true,
      label: '设计条目',
      description: '概要设计条目列表',
      itemType: {
        topic: { type: 'string' as const, required: true, label: '主题' },
        title: { type: 'string' as const, required: true, label: '标题' },
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
      },
      defaultValue: [
        {
          topic: '主题一',
          title: '示例设计标题一',
          image: 'https://placehold.co/720x440/0ea5e9/ffffff?text=Design+1',
        },
        {
          topic: '主题二',
          title: '示例设计标题二',
          image: 'https://placehold.co/720x440/6366f1/ffffff?text=Design+2',
        },
      ],
    },
  },
} as const
