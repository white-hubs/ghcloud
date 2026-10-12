import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './project-plan-edit.module.less'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DisinfectionTask } from './components/disinfection-task/disinfection-task'
import { BasicInfo } from './components/basic-info/basic-info'
import { cubeZhongdaHeshunService } from '@/api/service'
import dayjs from 'dayjs'
interface FormData {
  id?: string;
  planName: string;
  projectId: string;
  beginTime: string;
  endTime: string;
  projectLeaderId: string;
  taskTimeLimitConfig: {
    day: number;
    hour: number;
    minute: number;
  };
  taskGenerationCycleConfigs: {
    type: string;
    day?: string;
    time: string;
  }[];
  remark?: string;
  status: boolean;
}
interface ListData {
  id?: string;
  taskTypeId: string;
  taskTypeName: string;
  taskName: string;
  taskAreaId: string;
  disinfectionFrequency: string;
  notificationType: string;
  notificationGroupId: string;
  notificationDeptId: string;
  notificationPostId: string;
  notificationRoleId: string;
}
export const ProjectPlanEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const planId = route.query.id as string
    const state = reactive<{
      formState: Record<string, unknown>;
      loading: boolean;
    }>({
      formState: {},
      loading: false
    })
    const initFormState = ref<Record<string, unknown>>({})
    const taskList = ref<Record<string, unknown>[]>([])
    const title = computed(() => {
      const titleType = {
        info: '项目计划详情',
        edit: '编辑项目计划',
        create: '新增项目计划',
        copy: '新增项目计划'
      }
      return titleType[route.query.type as unknown as keyof typeof titleType | 'create'] ?? '新增项目计划'
    })
    const projectId = ref<string>('')
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> ; }>()
    const disinfectionTaskRef = ref<{ getApiParams: () => unknown[]; }>()
    const handleSubmit = async (): Promise<void> => {

      // const type = route.query.type as string
      const formValue = await basicInfoRef.value?.handleSubmit() as unknown as FormData
      const formData = {
        ...formValue,
        beginTime: dayjs(formValue.beginTime).format('YYYY-MM-DDTHH:mm:ss'),
        endTime: dayjs(formValue.endTime).format('YYYY-MM-DDTHH:mm:ss'),
      }
      const disinfectionTasks = disinfectionTaskRef.value?.getApiParams() as ListData[]
      if (!disinfectionTasks?.length) {
        message.error('消杀任务不能为空')
        return
      }
      const newDisinfectionTasks = disinfectionTasks.map((item, key) => {
        return {
          ...item,
          taskName: `消杀任务${key + 1}`,
        }
      })
      try {
        state.loading = true
        const params = {
          ...formData,
          planTaskConfigList: newDisinfectionTasks,
          enable: formData.status ? 'ENABLE' : 'DISABLE'
        }
        await cubeZhongdaHeshunService.addProjectPlanPage(params)
        history.back()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getDetails()
      // if (record){
      //   const newRecord = JSON.parse(record)
      //   state.formState = newRecord
      //   taskList.value = newRecord.planTaskConfigList
      // }
    })
    const getDetails = async (): Promise<void> => {
      // const type = route.query.type as string
      if (!planId) return
      try {
        const res = await cubeZhongdaHeshunService.getProjectPlanDetail(planId)
        state.formState = {
          ...res,
          // name: type === 'copy' ? res.name + '-副本-' + dayjs().format('YYYY-MM-DD') : res.name,
        }
        projectId.value = res.projectId
        initFormState.value = { ...res }
        taskList.value = res.planTaskConfigList
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles['edit-content']}>
            <div class={styles.title}>基础信息</div>
            <BasicInfo initFormState={initFormState.value} ref={basicInfoRef} onProjectChange={(value: string)=>{
              projectId.value = value
            }} />
            <div class={styles.title}>消杀任务</div>
            <DisinfectionTask ref={disinfectionTaskRef} initTasks={taskList.value} projectId={projectId.value} />
          </div>
        )
      },

      'footer-page': (): JSX.Element => {
        return (
          <Space>
            <Button onClick={() => {
              history.back()
            }} >返回</Button>
            {
              route.query.type !== 'info' &&
              <Button type='primary' loading={state.loading} onClick={handleSubmit} >保存</Button>
            }
          </Space>
        )
      }
    }
    return (): JSX.Element => (
      <CubeLayout title={title.value} v-slots={layoutSlots} />
    )
  }
})