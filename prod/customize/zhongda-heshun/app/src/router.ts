import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/task-type',
    name: 'task-type',
    component: async () => (await import('@/views/business-set/task-type/task-type')).TaskType
  },
  {
    path: '/project-type',
    name: 'project-type',
    component: async () => (await import('@/views/business-set/project-type/project-type')).ProjectType
  },
  {
    path: '/project-library',
    name: 'project-library',
    component: async () => (await import('@/views/project-manage/project-library/project-library')).ProjectLibrary
  },
  {
    path: '/project-library-edit',
    name: 'project-library-edit',
    component: async () => (await import('@/views/project-manage/project-library/project-library-edit')).ProjectLibraryEdit
  },
  {
    path: '/project-details',
    name: 'project-details',
    component: async () => (await import('@/views/project-manage/project-library/project-details/project-details')).ProjectDetails
  },
  {
    path: '/project-file',
    name: 'project-file',
    component: async () => (await import('@/views/project-manage/project-file/project-file')).ProjectFile
  },
  {
    path: '/project-area',
    name: 'project-area',
    component: async () => (await import('@/views/project-manage/project-area/project-area')).ProjectArea
  },
  {
    path: '/project-area-edit',
    name: 'project-area-edit',
    component: async () => (await import('@/views/project-manage/project-area/project-area-edit/project-area-edit')).ProjectAreaEdit
  },
  {
    path: '/project-group',
    name: 'project-group',
    component: async () => (await import('@/views/project-manage/project-group/project-group')).ProjectGroup
  },
  {
    path: '/project-group-edit',
    name: 'project-group-edit',
    component: async () => (await import('@/views/project-manage/project-group/project-group-edit/project-group-edit')).ProjectGroupEdit
  },
  {
    path: '/project-place',
    name: 'project-place',
    component: async () => (await import('@/views/project-manage/project-place/project-place')).ProjectPlace
  },
  {
    path: '/project-place-details',
    name: 'project-place-details',
    component: async () => (await import('@/views/project-manage/project-place/project-place-details/project-place-details')).ProjectPlaceDetails
  },
  {
    path: '/project-plan',
    name: 'project-plan',
    component: async () => (await import('@/views/project-manage/project-plan/project-plan')).ProjectPlan
  },
  {
    path: '/project-plan-edit',
    name: 'project-plan-edit',
    component: async () => (await import('@/views/project-manage/project-plan/project-plan-edit/project-plan-edit')).ProjectPlanEdit
  },
  {
    path: '/project-emergency-task',
    name: 'project-emergency-task',
    component: async () => (await import('@/views/project-manage/project-task/project-emergency-task')).ProjectEmergencyTask
  },
  {
    path: '/project-daily-task',
    name: 'project-daily-task',
    component: async () => (await import('@/views/project-manage/project-task/project-daily-task')).ProjectDailyTask
  },
  {
    path: '/project-correction-task',
    name: 'project-correction-task',
    component: async () => (await import('@/views/project-manage/project-task/project-correction-task')).ProjectCorrectionTask
  },
  {
    path: '/project-task-detail',
    name: 'project-task-detail',
    component: async () => (await import('@/views/project-manage/project-task/project-task-detail')).ProjectTaskDetail
  },
  {
    path: '/message',
    name: 'message',
    component: async () => (await import('@/views/message/message')).Message
  },

]
