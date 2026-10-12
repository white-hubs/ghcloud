import { defineComponent } from 'vue'
import { LinkConfig } from './components/link-config/link-config'

/** 考试链接 */
export const ExamLink = defineComponent({

  setup () {
    return (): JSX.Element => {
      return <LinkConfig type='EXAM_TASK' />
    }
  }
})
