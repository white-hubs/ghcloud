import { defineComponent } from 'vue'
import { LinkConfig } from './components/link-config/link-config'

/** 培训链接 */
export const TrainLink = defineComponent({

  setup () {
    return (): JSX.Element => {
      return <LinkConfig type='CULTIVATE_TASK' />
    }
  }
})
