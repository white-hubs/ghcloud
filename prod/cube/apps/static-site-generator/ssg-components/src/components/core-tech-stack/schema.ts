export const schema = {
  name: 'CoreTechStack',
  title: '核心技术栈',
  description: '5大核心技术能力卡片展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '区块标题', defaultValue: '核心技术栈' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    technologies: {
      type: 'array' as const,
      required: true,
      label: '技术栈列表',
      itemType: {
        name: { type: 'string' as const, required: true, label: '名称' },
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        description: { type: 'string' as const, required: true, label: '描述', editor: 'textarea' as const },
        href: { type: 'string' as const, required: false, label: '链接' },
        bgColor: { type: 'string' as const, required: false, label: '背景色', editor: 'color' as const },
        iconBgColor: { type: 'string' as const, required: false, label: '图标背景色', editor: 'color' as const },
      },
      defaultValue: [
        {
          name: '技术能力一',
          icon: 'https://placehold.co/388x239/e2e8f0/0f172a?text=Tech+1',
          description: '默认技术说明，便于在设计器里直接预览版式。',
          href: '#',
        },
        {
          name: '技术能力二',
          icon: 'https://placehold.co/388x239/cbd5e1/0f172a?text=Tech+2',
          description: '默认技术说明，便于在设计器里直接预览版式。',
          href: '#',
        },
        {
          name: '技术能力三',
          icon: 'https://placehold.co/388x239/94a3b8/ffffff?text=Tech+3',
          description: '默认技术说明，便于在设计器里直接预览版式。',
          href: '#',
        },
        {
          name: '技术能力四',
          icon: 'https://placehold.co/388x239/64748b/ffffff?text=Tech+4',
          description: '默认技术说明，便于在设计器里直接预览版式。',
          href: '#',
        },
        {
          name: '技术能力五',
          icon: 'https://placehold.co/388x239/475569/ffffff?text=Tech+5',
          description: '默认技术说明，便于在设计器里直接预览版式。',
          href: '#',
        },
      ],
    },
  },
} as const
