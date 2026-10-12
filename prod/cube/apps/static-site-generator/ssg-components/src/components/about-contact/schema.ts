export const schema = {
  name: 'AboutContact',
  title: '关于我们联系我们',
  description: '带标签切换的联系地址信息组件，支持高德地图',
  interactive: true,
  props: {
    locations: {
      type: 'array' as const,
      required: true,
      label: '地址列表',
      defaultValue: [
        {
          name: '成都总部',
          phone: '400-000-0000',
          address: '成都市高新区示例大道 88 号',
          lng: 104.056715,
          lat: 30.5859133,
        },
        {
          name: '长沙中心',
          phone: '0731-00000000',
          address: '长沙市岳麓区示例路 66 号',
          lng: 112.938814,
          lat: 28.228209,
        },
      ],
      itemType: {
        name: { type: 'string' as const, required: true, label: '名称' },
        phone: { type: 'string' as const, required: true, label: '电话' },
        address: { type: 'string' as const, required: true, label: '地址' },
        lng: { type: 'number' as const, required: false, label: '经度' },
        lat: { type: 'number' as const, required: false, label: '纬度' },
      }
    },
    mapKey: { type: 'string' as const, required: false, label: '高德地图Key', description: '用于加载高德地图 JS API' },
  },
} as const
