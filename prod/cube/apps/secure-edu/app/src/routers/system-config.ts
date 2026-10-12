export default [
  {
    path: '/courseware',
    name: 'Courseware',
    component: async (): Promise<unknown> => (await import('@/views/system-config/courseware')).Courseware
  },
  {
    path: '/courseware-form',
    name: 'CoursewareForm',
    component: async (): Promise<unknown> => (await import('@/views/system-config/courseware-form')).CoursewareForm
  },
  {
    path: '/question',
    name: 'Question',
    component: async (): Promise<unknown> => (await import('@/views/system-config/question')).Question
  },
  {
    path: '/question-form',
    name: 'QuestionForm',
    component: async (): Promise<unknown> => (await import('@/views/system-config/question-form')).QuestionForm
  },
  {
    path: '/theme',
    name: 'Theme',
    component: async (): Promise<unknown> => (await import('@/views/system-config/theme')).Theme
  },
  {
    path: '/train-link',
    name: 'TrainLink',
    component: async (): Promise<unknown> => (await import('@/views/system-config/train-link')).TrainLink
  },
  {
    path: '/exam-link',
    name: 'ExamLink',
    component: async (): Promise<unknown> => (await import('@/views/system-config/exam-link')).ExamLink
  },
  {
    path: '/paper-question-rule',
    name: 'PaperQuestionRule',
    component: async (): Promise<unknown> => (await import('@/views/system-config/paper-question-rule')).PaperQuestionRule
  },
  {
    path: '/paper-question-rule-form',
    name: 'PaperQuestionRuleForm',
    component: async (): Promise<unknown> => (await import('@/views/system-config/paper-question-rule-form')).PaperQuestionRuleForm
  },
]
