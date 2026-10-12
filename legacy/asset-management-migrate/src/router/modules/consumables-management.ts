import check from '@/views/consumables-management/check.vue'
import checkDetail from '@/views/consumables-management/check-detail.vue'
import consuming from '@/views/consumables-management/consuming.vue'
import entering from '@/views/consumables-management/entering.vue'
import justInTime from '@/views/consumables-management/just-in-time.vue'

export default [
  {
    path: '/justInTime',
    name: 'justInTime',
    component: justInTime,
  },
  {
    path: '/entering',
    name: 'entering',
    component: entering,
  },
  {
    path: '/consuming',
    name: 'consuming',
    component: consuming,
  },
  {
    path: '/consumable-check',
    name: 'consumableCheck',
    component: check,
  },
  {
    path: '/consumable-check-detail',
    name: 'checkDetail',
    component: checkDetail,
  },
]
