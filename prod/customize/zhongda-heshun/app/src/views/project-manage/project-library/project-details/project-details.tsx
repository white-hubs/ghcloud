import { CubeLayout } from '@ghcloud/cube-app-design'
import { TabPane, Tabs, Button } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import { ProjectForm } from '../project-form/project-form'
import { ProjectFile } from './components/tab-file/tab-file'
import { TabProjectArea } from './components/tab-area/tab-area'
import { TabProjectPlace } from './components/tab-place/tab-place'
import { TabProjectPerson } from './components/tab-user/tab-user'
import { TabProjectTask } from './components/tab-task/tab-task'

export enum ProjectDetailsTab {
  INFO = 'ibf',
  FILE = 'file',
  AREA = 'area',
  PLACE = 'place',
  PERSON = 'person',
  TASK = 'task',
}
interface Props {
  id: string;
}
export const ProjectDetails = defineComponent({
  name: 'ProjectDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  emits: ['cancel'],
  setup: (props: Props, { emit }) => {

    const activeKey = ref<string>(ProjectDetailsTab.INFO)
    const goBack = (): void => {
      emit('cancel')
    }
    const onTabChange = (key: string): void =>{
      activeKey.value = key
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class='message-config'>
            <Tabs activeKey={activeKey.value} type='card' onTabChange={onTabChange}>
              <TabPane tab='基础信息' key={ProjectDetailsTab.INFO}>
                <ProjectForm projectId={props.id} action={'details'} />
              </TabPane>
              <TabPane tab='项目资料' key={ProjectDetailsTab.FILE}>
                <ProjectFile projectId={props.id as string ?? ''} />
              </TabPane>
              <TabPane tab='项目区域' key={ProjectDetailsTab.AREA}>
                <TabProjectArea projectId={props.id as string ?? ''} />
              </TabPane>
              <TabPane tab='项目重点场所' key={ProjectDetailsTab.PLACE}>
                <TabProjectPlace projectId={props.id as string ?? ''} />
              </TabPane>
              <TabPane tab='项目人员' key={ProjectDetailsTab.PERSON}>
                <TabProjectPerson projectId={props.id as string ?? ''} />
              </TabPane>
              <TabPane tab='项目任务' key={ProjectDetailsTab.TASK}>
                <TabProjectTask projectId={props.id as string ?? ''} />
              </TabPane>
            </Tabs>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
          </>
        )
      }
    }

    return (): JSX.Element =>
      <>
        <CubeLayout title={'项目详情'} v-slots={layoutSlots} />
      </>

  }
})