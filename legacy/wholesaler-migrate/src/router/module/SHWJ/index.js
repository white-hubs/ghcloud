export const SHWJ = [
  {
    path: '/notice-setting-quest',
    name: '通知设置',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/TZSZ/index'),
    meta: {
      title: '通知设置',
    },
  },{
    path: '/questionnaire-examine',
    name: '问卷调查',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJDC/index'),
    meta: {
      title: '问卷调查',
    },
  },
  {
    path: '/questionnaire-examine/add',
    name: '新建问卷',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJDC/Modal/CreateEdit'),
    meta: {
      title: '新建问卷',
    },
  },
  {
    path: '/questionnaire-examine/edit/:id',
    name: '编辑问卷',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJDC/Modal/CreateEdit'),
    meta: {
      title: '编辑问卷',
    },
  },
  {
    path: '/questionnaire-examine/:id',
    component: () => import('@/views/PFSGL/SHWJ/WJDC/Details/EventDetail'),
    name: '问卷详情',
    meta: {
      title: '问卷详情',
    },
  },
  {
    path: '/investigation-detail',
    component: () =>
      import('@/views/PFSGL/SHWJ/WJDC/Details/investigationDetail'),
    name: '调查详情',
    meta: {
      title: '调查详情',
    },
  },
  {
    path: '/questionnaire-analysis/:id',
    component: () =>
      import('@/views/PFSGL/SHWJ/WJDC/Modal/testPaperAnalysis'),
    name: '试卷分析',
    meta: {
      title: '试卷分析',
    },
  },{
    path: '/questionnaire-temp',
    name: '问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/index'),
    meta: {
      title: '问卷模板',
    },
  },
  {
    path: '/questionnaire-temp/add',
    name: '添加问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Modal/CreateEdit'),
    meta: {
      title: '添加问卷模板',
    },
  },
  {
    path: '/questionnaire-temp/edit/:id',
    name: '编辑问卷模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Modal/CreateEdit'),
    meta: {
      title: '编辑问卷模板',
    },
  },
  {
    path: '/questionnaire-temp/detail/:id',
    name: '问卷模板详情',
    exact: true,
    component: () => import('@/views/PFSGL/SHWJ/WJMB/Details'),
    meta: {
      title: '问卷模板详情',
    },
  },
]