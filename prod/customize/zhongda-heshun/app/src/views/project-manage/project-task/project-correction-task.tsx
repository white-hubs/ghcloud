import { defineComponent, onMounted } from 'vue'
import { ProjectTaskTemplate } from './project-task-template'

export const ProjectCorrectionTask = defineComponent({
  setup: () => {

    // const { pageTitle } = usePageName()

    onMounted(async () => {

    })

    return (): JSX.Element => (
      <ProjectTaskTemplate tableCode='PROJECT_CORRECTION_TASK' > </ProjectTaskTemplate>
    )
  }
})