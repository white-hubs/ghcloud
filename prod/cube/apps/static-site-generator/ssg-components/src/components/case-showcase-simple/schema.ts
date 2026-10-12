export const schema = {
  name: 'CaseShowcaseSimple',
  title: '简约案例展示',
  description: '简洁案例卡片列表展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '区块标题', defaultValue: '精选案例' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '部分客户真实落地案例' },
    cases: {
      type: 'array' as const,
      required: true,
      label: '案例列表',
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
        link: { type: 'string' as const, required: false, label: '链接' },
      },
      defaultValue: [
        { image: 'https://placehold.co/560x320/0ea5e9/ffffff?text=Case+1', title: '示例案例一', link: '#' },
        { image: 'https://placehold.co/560x320/6366f1/ffffff?text=Case+2', title: '示例案例二', link: '#' },
        { image: 'https://placehold.co/560x320/22c55e/ffffff?text=Case+3', title: '示例案例三', link: '#' },
      ],
    },
    viewMoreLink: { type: 'string' as const, required: false, label: '查看更多链接', defaultValue: '#' },
  },
} as const
