export default [
  {
    path: '/outside-link-train',
    name: 'OutsideLinkTrain',
    component: async (): Promise<unknown> => (await import('@/views/secure-training/training-task')).TrainingTask
  },
  {
    path: '/outside-link-exam',
    name: 'OutsideLinkExam',
    component: async (): Promise<unknown> => (await import('@/views/secure-exam/exam-task')).ExamTask
  },
]
