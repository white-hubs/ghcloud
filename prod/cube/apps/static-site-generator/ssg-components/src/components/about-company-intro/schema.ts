export const schema = {
  name: 'AboutCompanyIntro',
  title: '关于我们企业简介',
  description: '企业简介板块，左侧图片右侧文字描述',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '板块标题', defaultValue: '企业简介' },
    image: {
      type: 'string' as const,
      required: true,
      label: '企业图片',
      editor: 'image' as const,
      description: '企业介绍配图URL',
      defaultValue: 'https://placehold.co/720x480/0ea5e9/ffffff?text=Company',
    },
    companyName: {
      type: 'string' as const,
      required: true,
      label: '公司名称',
      description: '企业全称',
      defaultValue: '示例企业有限公司',
    },
    description: {
      type: 'string' as const,
      required: true,
      label: '企业介绍文案',
      description: '支持HTML换行',
      defaultValue: '这是一段企业简介示例文案，用于设计器预览时展示段落排版与视觉效果，可在右侧面板替换为真实内容。',
    },
  },
} as const
