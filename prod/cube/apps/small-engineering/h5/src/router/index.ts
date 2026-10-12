import type { AppRoutes } from '@ghcloud/cube-app-generic-component'

const routers: AppRoutes = [
  {
    name: 'index',
    path: '/',
    redirect: '/entry',
  },
  {
    name: 'Entry',
    path: '/entry',
    component: async () => (await import('@/views/entry/entry')).Entry,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'engineeringManagement',
    path: '/engineeringManagement',
    component: async () => (await import('@/views/engineering-manage/engineering-mange')).EngineeringManage
  },
  {
    name: 'feedback',
    path: '/feedback',
    component: async () => (await import('@/views/project-down-turn/feedback')).Feedback
  },
  {
    name: 'feedback-details',
    path: '/feedback-details',
    component: async () => (await import('@/views/project-down-turn/feedback-details')).FeedbackDetails
  },
  {
    name: 'checkAndAccept',
    path: '/checkAndAccept',
    component: async () => (await import('@/views/project-down-turn/check-and-accept')).CheckAndAccept
  },
  {
    name: 'engineeringAllList',
    path: '/engineeringAllList',
    component: async () => (await import('@/views/engineering-all-list/engineering-all-list')).EngineeringAllList,
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: __ENV__.applicationCode
      }
    }
  },
  {
    name: 'project-supervise-add',
    path: '/project-supervise-add',
    meta: {
      title: '新增工程'
    },
    component: async () => (await import('@/views/project-supervise/project-supervise-add')).ProjectSuperviseAdd
  },
  {
    name: 'project-supervise-detail',
    path: '/project-supervise-detail',
    meta: {
      title: '工程监管详情'
    },
    component: async () => (await import('@/views/project-supervise/project-supervise-detail')).ProjectSuperviseDetail
  },
  {
    name: 'person-page',
    path: '/person-page',
    meta: {
      title: '选择人员'
    },
    component: async () => (await import('@/views/project-supervise/person-page/index')).PersonPage
  },

  {
    name: 'baseFlowProcessRecordAll',
    path: '/baseFlowProcessApply?businessType=PROJECT_APPLY',
    meta: {
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    redirect: '',
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROJECT_APPLY',
        processType: 'ADD'
      }
    }
  },
  {
    name: 'baseFlowProcessRecordAll',
    path: '/baseFlowProcessApply?businessType=PROJECT_SIGN_CONTRACT',
    meta: {
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    redirect: '',
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROJECT_SIGN_CONTRACT',
        processType: 'ADD'
      }
    }
  },
  {
    name: 'engineeringInspection',
    path: '/engineeringInspection',
    component: async () => (await import('@/views/inspection/inspection-task/my-inspection')).MyInspection,
    meta: {
      title: '工程巡查'
    }
  },
  {
    name: 'engineeringInspectionNew',
    path: '/engineeringInspectionNew',
    component: async () => (await import('@/views/daily-task/daily-task')).TaskList,
    meta: {
      title: '工程巡查new'
    }
  },
  {
    name: 'inspection-task-detail',
    path: '/inspection-task-detail',
    component: async () => (await import('@/views/inspection/inspection-task/inspection-task-detail')).InspectionDetail,
    meta: {
      title: '巡检任务详情'
    }
  },
  {
    name: 'inspection-record',
    path: '/inspection-record',
    component: async () => (await import('@/views/inspection/inspection-record/inspection-record-list')).InspectionRecordList,
    meta: {
      title: '巡检记录'
    }
  },
  {
    name: 'inspection-record-detail',
    path: '/inspection-record-detail',
    component: async () => (await import('@/views/inspection/inspection-record/inspection-record-detail')).InspectionDetail,
    meta: {
      title: '巡检记录详情'
    }
  },
  {
    name: 'inspection-execute',
    path: '/inspection-execute',
    component: async () => (await import('@/views/inspection/inspection-execute/inspection-execute')).InspectionExecute,
    meta: {
      title: '巡检记录详情'
    }
  },
  {
    name: 'engineeringRectification',
    path: '/engineeringRectification',
    meta: {
      title: '工程整改',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    redirect: '',
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROJECT_REFORM',
        processType: 'ADD'
      }
    }
  },
  {
    name: 'temporary-patrol',
    path: '/temporary-patrol',
    component: async () => (await import('@/views/inspection/temporary-patrol/temporary-patrol')).TemporaryPatrol,
    meta: {
      title: '临时巡查'
    }
  },
  {
    name: 'temporary-patrol-record',
    path: '/temporary-patrol-record',
    component: async () => (await import('@/views/inspection/temporary-patrol-record/temporary-patrol-record')).TemporaryPatrolRecord,
    meta: {
      title: '临时巡查记录'
    }
  },
  {
    name: 'temporary-patrol-details',
    path: '/temporary-patrol-details',
    component: async () => (await import('@/views/inspection/temporary-patrol-details/temporary-patrol-details')).TemporaryPatrolDetails,
    meta: {
      title: '临时巡查详情'
    }
  },

]

export const routes: AppRoutes = [
  ...routers,
]
