import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './patrol-task-edit.module.less'
import { BasicInfo } from './components/basic-info'
import { PatrolContentTable, type DataSourceType } from '../../components/patrol-content-table'
import { Space, Button, message, Tabs, TabPane } from '@ghcloud/cube-ui'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { ExecuteProgress } from './components/execute-progress'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
export const PatrolTaskEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      formState: Record<string, unknown>;
      tableData: DataSourceType[];
      loading: boolean;
    }>({
      formState: {},
      tableData: [],
      loading: false
    })
    const title = computed(() => {
      const titleType = {
        info: '巡检任务详情',
        create: '新增巡检计划',
      }
      return titleType[route.query.type as unknown as keyof typeof titleType | 'create'] ?? '新增巡检任务'
    })
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> ; }>()
    const patrolContentRef = ref<{ getApiParams: () => unknown[]; }>()
    const handleSubmit = async (): Promise<void> => {
      const formValue = await basicInfoRef.value?.handleSubmit() as Record<string, string>
      const taskTargetDTOList = patrolContentRef.value?.getApiParams()
      const strandList = taskTargetDTOList?.filter((item) => (item as Record<string, string>).standardId)
      if (!taskTargetDTOList?.length) {
        message.error('巡检内容不能为空')
        return
      }
      if (!strandList?.length) {
        message.error('请选择巡检标准')
        return
      }
      try {
        state.loading = true
        const params = {
          ...formValue,
          taskTargetDTOList,
          receiveIds: (formValue as unknown as { receiveIds: string[]; }).receiveIds.join(','),
          validBeginTime: formValue.beginTime,
          validEndTime: formValue.endTime,
          cronId: formValue.cronId === 'custom' ? '' : formValue.cronId,
          enable: 1,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        }
        // 新增
        await cubeDailyInspectionService.createInspectTask(params)
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }

      // 编辑
      history.back()
    }
    onMounted(() => {
      getDetails()
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      if (!id) return
      try {
        const res = await cubeDailyInspectionService.getInspectTaskDetail({ id, businessType: InspectBusinessType.SMALL_ENGINEERING })
        state.tableData = (res.typeTargets as unknown[]).flat() as DataSourceType[]
        state.formState = res
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            {route.query.type === 'info' &&
              <Tabs defaultActiveKey='1'>
                <TabPane tab='基本信息' key='1'>
                  <div class={styles['edit-content']}>
                    <div class={styles.title}>基础信息</div>
                    <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
                    <div class={styles.title}>巡检内容</div>
                    <PatrolContentTable dataSource={state.tableData} ref={patrolContentRef} />
                  </div>
                </TabPane>
                <TabPane tab='执行进度' key='2'>
                  <ExecuteProgress />
                </TabPane>
              </Tabs>}
            {
              route.query.type !== 'info' &&
                <div class={styles['edit-content']}>
                  <div class={styles.title}>基础信息</div>
                  <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
                  <div class={styles.title}>巡检内容</div>
                  <PatrolContentTable dataSource={state.tableData} ref={patrolContentRef} />
                </div>
            }
          </>

        )
      },

      'footer-page': (): JSX.Element => {
        return (
          <Space>
            <Button onClick={() => {
              // 返回
              history.back()
            }}
            >返回
            </Button>
            {
              route.query.type !== 'info' &&
              <Button
                type='primary' loading={state.loading} onClick={handleSubmit}
              >保存
              </Button>
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
