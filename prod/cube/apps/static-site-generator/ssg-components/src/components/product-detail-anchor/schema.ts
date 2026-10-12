export const schema = {
  name: 'ProductDetailAnchor',
  title: '产品详情锚点',
  description: '产品详情页锚点导航栏',
  interactive: true,
  props: {
    anchors: {
      type: 'array' as const,
      required: true,
      label: '锚点列表',
      itemType: {
        id: { type: 'string' as const, required: true, label: 'ID' },
        name: { type: 'string' as const, required: true, label: '名称' },
      },
      defaultValue: [
        { id: 'overview', name: '产品概述' },
        { id: 'features', name: '产品特性' },
        { id: 'specs', name: '规格参数' },
        { id: 'cases', name: '相关案例' },
      ],
    },
    activeId: { type: 'string' as const, required: false, label: '当前锚点ID', defaultValue: 'overview' },
  },
} as const
