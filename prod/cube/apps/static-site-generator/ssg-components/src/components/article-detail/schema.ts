export const schema = {
  name: 'ArticleDetail',
  title: '文章详情',
  description: '资讯文章详情内容展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '文章标题', defaultValue: '默认文章标题' },
    createTime: { type: 'string' as const, required: true, label: '发布时间', defaultValue: '2026-04-20' },

    content: {
      type: 'string' as const,
      required: true,
      label: '正文内容',
      description: '支持 HTML',
      defaultValue: '<p>这里是默认文章内容，用于页面设计器预览文章详情版式效果。</p>',
    },
  },
} as const
