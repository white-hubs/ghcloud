export const schema = {
  name: 'ModelingAssetLibrary',
  title: '建模资源库',
  description: '建模资源库展示，支持图标+标题+描述卡片',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '区块标题', defaultValue: '建模资源库' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '丰富的标准资源，开箱即用' },
    items: {
      type: 'array' as const,
      required: true,
      label: '资源列表',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
        description: { type: 'string' as const, required: true, label: '描述' },
      },
      defaultValue: [
        { icon: 'https://placehold.co/96x96/0ea5e9/ffffff?text=A1', title: '资源一', description: '示例资源描述文案一。' },
        { icon: 'https://placehold.co/96x96/6366f1/ffffff?text=A2', title: '资源二', description: '示例资源描述文案二。' },
        { icon: 'https://placehold.co/96x96/22c55e/ffffff?text=A3', title: '资源三', description: '示例资源描述文案三。' },
      ],
    },
  },
} as const
