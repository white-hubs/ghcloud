export default [
  {
    path: '/training-task',
    name: 'TrainingTask',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-task')).TrainingTask
  },
  {
    path: '/training-task-form',
    name: 'TrainingTaskForm',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-task-form')).TrainingTaskForm
  },
  {
    path: '/training-count',
    name: 'TrainingCount',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-count')).TrainingCount
  },
  {
    path: '/training-detials',
    name: 'TrainingDetials',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-details')).TrainingDetiles
  },
  {
    path: '/training-records',
    name: 'TrainingRecords',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-records')).TrainingRecords
  },
]
