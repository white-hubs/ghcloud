export const home = [
	{
		path: '/evaluate-overview',
		meta: { title: '评价概览' },
		component: () => import('@/views/evaluate-overview/index.vue')
	},
	{
		path: '/purchase-evaluate-config',
		meta: { title: '采购评价配置' },
		component: () => import('@/views/purchase-evaluate-config/index.vue')
	},
	{
		path: '/sensitive-words-thesaurus',
		meta: { title: '敏感词词库' },
		component: () => import('@/views/sensitive-words-thesaurus/index.vue')
	},
	{
		path: '/evaluation-review',
		meta: { title: '评价审核' },
		component: () => import('@/views/evaluation-review/index.vue')
	},

	{
		path: '/evaluation-review-detail/:id/:status',
		exact: true,
		component: () => import('@/views/evaluation-review/Details/EventDetail.vue'),
		meta: {
			title: '评价审核-详情',
		},
	},

	{
		path: '/store-score',
		exact: true,
		component: () => import('@/views/store-score/index.vue'),
		meta: {
			title: '档位分值',
		},
	},
	{
		path: '/store-score/:id',
		component: () => import('@/views/store-score/Details/EventDetail'),
		meta: {
			title: '档位详情',
		},
	},
	{
		path: '/evaluate-record-detail/:id',
		component: () =>
			import('@/views/store-score/Details/Details/EventDetail'),
		name: '评价详情',
		meta: {
			title: '评价详情',
		},
	},
	{
		path: '/evaluate-config',
		exact: true,
		component: () => import('@/views/evaluate-config/index.vue'),
		meta: {
			title: '评价配置',
		},
	},
	{
		path: '/evaluate-config/:id',
		component: () => import('@/views/evaluate-config/Details/EventDetail.vue'),
		meta: {
			title: '配置详情',
		},
	},
	{
		path: '/statistical-report',
		exact: true,
		component: () => import('@/views/statistical-report/index.vue'),
		meta: {
			title: '统计报表',
		},
	},
	{
		path: '/statistics-detail/:id/:Dname',
		exact: true,
		component: () => import('@/views/statistical-report/Details/statisticsDetail.vue'),
		meta: {
			title: '统计报表',
		},
	},
]
