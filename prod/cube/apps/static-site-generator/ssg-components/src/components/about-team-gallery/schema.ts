export const schema = {
  name: 'AboutTeamGallery',
  title: '关于我们团队画廊',
  description: '悬停展开的团队成员图片画廊',
  interactive: true,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '我们的团队' },
    subtitle: {
      type: 'string' as const,
      required: false,
      label: '副标题',
      defaultValue: '在成都、长沙、深圳设立了研发中心和业务中心，具备强大的产品技术实力与完善的服务能力',
    },
    images: {
      type: 'array' as const,
      required: false,
      label: '团队图片列表（兼容）',
      description: '团队展示图片URL数组，与 items 二选一',
      defaultValue: [
        'https://placehold.co/570x370/e2e8f0/0f172a?text=Team+1',
        'https://placehold.co/570x370/cbd5e1/0f172a?text=Team+2',
        'https://placehold.co/570x370/94a3b8/ffffff?text=Team+3',
        'https://placehold.co/570x370/64748b/ffffff?text=Team+4',
      ],
      itemType: 'string'
    },
    items: {
      type: 'array' as const,
      required: false,
      label: '团队成员列表（推荐）',
      description: '团队成员对象数组，优先级高于 images',
      itemType: {
        image: { type: 'string' as const, required: true, label: '照片', editor: 'image' as const },
        name: { type: 'string' as const, required: false, label: '姓名' },
        role: { type: 'string' as const, required: false, label: '职位' },
      },
      defaultValue: [],
    },
  },
} as const
