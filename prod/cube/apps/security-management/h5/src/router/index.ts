import type { AppRoutes } from '@ghcloud/cube-app-generic-component'

const routers: AppRoutes = [
  {
    name: 'index',
    path: '/',
    redirect: '/entry',
  },
  {
    name: 'entry',
    path: '/entry',
    component: async () => (await import('@/views/entry/entry')).Entry,
  },
  {
    name: 'entry',
    path: '/entry',
    component: async () => (await import('@/views/entry/entry')).Entry,
  },
  {
    name: 'security-video',
    path: '/securityVideo',
    component: async () => (await import('@/views/security-video/security-video')).SecurityVideo,
  },
  {
    name: 'video-detail',
    path: '/video-detail',
    component: async () => (await import('@/views/security-video/video-detail')).VideoDetail,
  },
  {
    name: 'baseAlarmRecords',
    path: '/baseAlarmRecords?applicationCode=SECURITY_MONITORING',
    redirect: '/alarm-list',
  },
  {
    name: 'baseAlarmRecords2',
    path: '/baseAlarmRecords',
    redirect: '/alarm-list',
  },
  {
    name: 'alarm-list',
    path: '/alarm-list',
    meta: {
      title: '报警记录',
    },
    getQuery: async (): Promise<{
      sourceApp: string;
    }>=> {
      return {
        sourceApp: __ENV__.applicationCode,
      }
    },
    component: async () => (await import('@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-records')).AlarmRecords,
  },
  {
    name: 'alarm-handle',
    path: '/alarm-handle',
    meta: {
      title: '报警处理',
    },
    getQuery: async (): Promise<{
      sourceApp: string;
    }>=> {
      return {
        sourceApp: __ENV__.applicationCode,
      }
    },
    component: async () => (await import('@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-handle/alarm-handle')).AlarmHandle,
  },
  {
    name: 'alarm-transfer',
    path: '/alarm-transfer',
    meta: {
      title: '报警转交',
    },
    getQuery: async (): Promise<{
      sourceApp: string;
    }>=> {
      return {
        sourceApp: __ENV__.applicationCode,
      }
    },
    component: async () => (await import('@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-transfer/alarm-transfer')).AlarmTransfer,
  },
  {
    name: 'alarm-follow-up',
    path: '/alarm-follow-up',
    meta: {
      title: '报警跟进',
    },
    getQuery: async (): Promise<{
      sourceApp: string;
    }>=> {
      return {
        sourceApp: __ENV__.applicationCode,
      }
    },
    component: async () => (await import('@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-follow-up/alarm-follow-up')).AlarmFollowUp,
  },
  {
    name: 'alarm-details',
    path: '/alarm-details',
    meta: {
      title: '报警记录',
    },
    getQuery: async (): Promise<{
      sourceApp: string;
    }>=> {
      return {
        sourceApp: __ENV__.applicationCode,
      }
    },
    component: async () => (await import('@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details')).Details,
  },
  {
    name: 'security-analysis',
    path: '/securityAnalysis',
    meta: {
      title: '安全分析',
    },
    component: async () => (await import('@/views/security-analysis/security-analysis')).SecurityAnalysis,
  },
  {
    name: 'security-patrol-record',
    path: '/securityPatrolRecord',
    meta: {
      title: '巡逻记录',
    },
    component: async () => (await import('@/views/security-patrol-record/security-patrol-record')).SecurityPatrolRecord,
  },
  {
    name: 'security-patrol-detail',
    path: '/securityPatrolDetail',
    meta: {
      title: '巡逻记录详情',
    },
    component: async () => (await import('@/views/security-patrol-record/security-patrol-detail')).SecurityPatrolDetail,
  },
  {
    name: 'security-patrol-route',
    path: '/securityPatrolRoute',
    meta: {
      title: '巡逻路线',
    },
    component: async () => (await import('@/views/security-patrol-route/security-patrol-route')).SecurityPatrolRoutes,
  },
  {
    name: 'security-patrol-route-detail',
    path: '/securityPatrolRouteDetail',
    meta: {
      title: '视频巡逻',
    },
    component: async () => (await import('@/views/security-patrol-route/security-patrol-route-detail')).SecurityPatrolRouteDetail,
  },
]

export const routes: AppRoutes = [...routers]
