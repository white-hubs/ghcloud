export default [
  {
    path: '/exam-task-form',
    name: 'ExamTaskForm',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-task-form')).ExamTaskForm
  },
  {
    path: '/exam-task',
    name: 'ExamTask',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-task')).ExamTask
  },
  {
    path: '/exam-paper-detail',
    name: 'ExamPaperDetail',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-paper-detail')).ExamPaperDetail
  },
  {
    path: '/test-paper-manage',
    name: 'TestPaperManage',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/test-paper-manage')).TestPaperManage
  },
  {
    path: '/test-paper-manage-form',
    name: 'TestPaperManageForm',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/test-paper-manage-form')).TestPaperManageForm
  },
  {
    path: '/exam-count',
    name: 'ExamCount',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-count')).ExamCount
  },
  {
    path: '/exam-details',
    name: 'ExamDetails',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-details')).ExamDetails
  },
  {
    path: '/exam-records',
    name: 'ExamRecords',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-records')).ExamRecords
  },
]
