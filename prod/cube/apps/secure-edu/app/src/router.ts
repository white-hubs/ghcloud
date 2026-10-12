import type { RouteRecordRaw } from 'vue-router'
/** 安全培训 */
import SafetyTraining from '@/routers/safety-training'
/** 安全考试 */
import SafetyExam from '@/routers/secure-exam'
/** 系统配置 */
import SystemConfig from '@/routers/system-config'
/** 集团外链 */
import OutsideLink from '@/routers/outside-link'

import { Message } from '@/views/message/index'
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'over-view'
  },
  {
    name: 'over-view',
    path: '/over-view',
    component: async () => (await import('@/views/over-view/over-view')).OverView
  },
  {
    name: 'message',
    path: '/message',
    component: Message
  },
  ...SafetyTraining,
  ...SafetyExam,
  ...SystemConfig,
  ...OutsideLink
]
