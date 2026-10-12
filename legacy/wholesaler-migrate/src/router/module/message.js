export const MESSAGE = [
  {
    path: '/message-notice',
    name: '消息配置',
    exact: true,
    component: () => import('@/views/message-notice/message-notice.vue'),
    meta: {
      title: '消息配置',
    },
  },
];
