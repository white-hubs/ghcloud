export const SHDA = [
	{
		path: '/merchant-archives',
		meta: { title: '商户档案' },
		component: () => import('@/views/PFSGL/SHDA/index.vue')
	},
	{
		path: '/merchant-archives/:id',
		component: () => import('@/views/PFSGL/SHDA/Details/index.vue'),
		name: '商户档案详情',
		meta: {
			title: '商户档案详情',
		},
	},
]
