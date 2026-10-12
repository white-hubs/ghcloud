import { defineComponent, onMounted } from 'vue'
import { ProjectTaskTemplate } from './project-task-template'

export const ProjectEmergencyTask = defineComponent({
  setup: () => {

    // const { pageTitle } = usePageName()

    onMounted(async () => {

    })

    return (): JSX.Element => (
      <ProjectTaskTemplate tableCode='PROJECT_EMERGENCY_TASK'> </ProjectTaskTemplate>
    )
  }
})

