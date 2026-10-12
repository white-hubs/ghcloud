import { defineComponent, onMounted } from 'vue'
import { ProjectTaskTemplate } from './project-task-template'

export const ProjectDailyTask = defineComponent({
  setup: () => {

    // const { pageTitle } = usePageName()

    onMounted(async () => {

    })

    return (): JSX.Element => (
      <ProjectTaskTemplate tableCode='PROJECT_daily_TASK'> </ProjectTaskTemplate>
    )
  }
})