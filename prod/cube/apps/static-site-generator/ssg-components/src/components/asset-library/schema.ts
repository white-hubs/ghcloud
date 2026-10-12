export const schema = {
  name: 'AssetLibrary',
  title: '资源库',
  description: '图片资源网格展示，带标签说明',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '标题', defaultValue: '资源库' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    items: {
      type: 'array' as const,
      required: true,
      label: '资源项目列表',
      defaultValue: [
        { image: 'https://placehold.co/800x520/1e293b/ffffff?text=Asset+1', label: '资源示例一' },
        { image: 'https://placehold.co/800x520/334155/ffffff?text=Asset+2', label: '资源示例二' },
      ],
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        label: { type: 'string' as const, required: false, label: '标签' },
      }
    },
  },
} as const
