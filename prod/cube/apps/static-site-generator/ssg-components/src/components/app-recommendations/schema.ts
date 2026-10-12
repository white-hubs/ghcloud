export const schema = {
  name: 'AppRecommendations',
  title: '推荐应用',
  description: '应用推荐网格展示',
  interactive: true,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '推荐应用' },
    apps: {
      type: 'array' as const,
      required: true,
      label: '应用列表',
      itemType: {
        id: { type: 'string' as const, required: true, label: 'ID' },
        name: { type: 'string' as const, required: true, label: '名称' },
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        version: { type: 'string' as const, required: false, label: '版本' },
        description: { type: 'string' as const, required: false, label: '描述' },
        href: { type: 'string' as const, required: false, label: '链接' },
      },
      defaultValue: [
        {
          id: 'app-1',
          name: '示例应用一',
          icon: 'https://placehold.co/96x96/0ea5e9/ffffff?text=A1',
          version: 'v1.0',
          description: '示例应用描述一，用于设计器预览。',
          href: '#',
        },
        {
          id: 'app-2',
          name: '示例应用二',
          icon: 'https://placehold.co/96x96/6366f1/ffffff?text=A2',
          version: 'v2.0',
          description: '示例应用描述二，用于设计器预览。',
          href: '#',
        },
      ],
    },
  },
} as const
