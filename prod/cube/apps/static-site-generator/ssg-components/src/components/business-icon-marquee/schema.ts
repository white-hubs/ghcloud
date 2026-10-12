export const schema = {
  name: 'BusinessIconMarquee',
  title: '企业Logo无缝滚动',
  description: '3行Logo无缝横向滚动展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '众多企业数字化的优先选择' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '为500+企业伙伴提供全方位、先进的孪生空间管理服务' },
    logos: {
      type: 'array' as const,
      required: true,
      label: 'Logo列表',
      itemType: 'string',
      defaultValue: [
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+1',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+2',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+3',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+4',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+5',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+6',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+7',
        'https://placehold.co/160x60/ffffff/1578FF?text=Logo+8',
      ],
    },
  },
} as const
