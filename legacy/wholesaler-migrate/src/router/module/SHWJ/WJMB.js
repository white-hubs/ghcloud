export default [
  {
    path: 'questionnaire-temp',
    name: '问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/index'),
    meta: {
      title: '问卷模板',
    },
  },
  {
    path: 'questionnaire-temp/add',
    name: '添加问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Modal/CreateEdit'),
    meta: {
      title: '添加问卷模板',
    },
  },
  {
    path: 'questionnaire-temp/edit/:id',
    name: '编辑问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Modal/CreateEdit'),
    meta: {
      title: '编辑问卷模板',
    },
  },
  {
    path: 'questionnaire-temp/detail/:id',
    name: '问卷模板详情',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Details'),
    meta: {
      title: '问卷模板详情',
    },
  },
];
