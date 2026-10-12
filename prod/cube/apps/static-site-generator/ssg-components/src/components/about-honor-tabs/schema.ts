export const schema = {
  name: 'AboutHonorTabs',
  title: '关于我们荣誉资质',
  description: '带标签切换的荣誉资质图片展示组件',
  interactive: true,
  props: {
    stats: {
      type: 'array' as const,
      required: true,
      label: '统计数据',
      itemType: {
        img: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        value: { type: 'string' as const, required: true, label: '数值' },
        label: { type: 'string' as const, required: true, label: '说明' },
      },
      defaultValue: [
        { img: 'https://placehold.co/120x80/0ea5e9/ffffff?text=H1', value: '100+', label: '荣誉资质' },
        { img: 'https://placehold.co/120x80/6366f1/ffffff?text=H2', value: '50+', label: '专利证书' },
      ],
    },
    tabs: {
      type: 'array' as const,
      required: true,
      label: '分类标签',
      itemType: 'string',
      defaultValue: ['荣誉资质', '行业认证'],
    },
    images: {
      type: 'array' as const,
      required: true,
      label: '荣誉图片',
      itemType: {
        src: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        desc: { type: 'string' as const, required: false, label: '描述' },
        tabIndex: { type: 'number' as const, required: true, label: '所属标签索引' },
      },
      defaultValue: [
        { src: 'https://placehold.co/480x320/0ea5e9/ffffff?text=Honor+1', desc: '荣誉证书一', tabIndex: 0 },
        { src: 'https://placehold.co/480x320/6366f1/ffffff?text=Honor+2', desc: '荣誉证书二', tabIndex: 0 },
        { src: 'https://placehold.co/480x320/22c55e/ffffff?text=Cert+1', desc: '行业认证一', tabIndex: 1 },
        { src: 'https://placehold.co/480x320/f97316/ffffff?text=Cert+2', desc: '行业认证二', tabIndex: 1 },
      ],
    },
  },
} as const
