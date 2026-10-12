import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './inspect-task-edit.module.less'
import { BasicInfo } from './components/basic-info'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectContentTable } from '@/components/inspect-content-table/inspect-content-table'
import type { DataSourceType } from '@/types/inspect'

export const InspectTaskEdit = defineComponent({
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
        create: '新增巡检任务',
      }
      return titleType[route.query.type as unknown as keyof typeof titleType | 'create'] ?? '新增巡检任务'
    })
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> ; }>()
    const patrolContentRef = ref<{ getApiParams: () => unknown[]; }>()
    const handleSubmit = async (): Promise<void> => {
      const formValue = await basicInfoRef.value?.handleSubmit() as Record<string, string>
      const taskTargetDTOList = patrolContentRef.value?.getApiParams()
      if (!taskTargetDTOList?.length) {
        message.error('巡检内容不能为空')
        return
      }
      // 校验所有巡检对象（含新增的）都已选择巡检标准；
      // getApiParams 会为没有标准的对象兜底推送 standardId 为空的记录，避免对象丢失。
      const noStandardList = taskTargetDTOList?.filter((item) => !(item as Record<string, string>).standardId)
      if (noStandardList?.length) {
        message.error('请选择巡检标准')
        return
      }
      try {
        state.loading = true
        const params = {
          ...formValue,
          taskTargetDTOList,
          receiveIds: (formValue as unknown as { receiveIds: string[]; }).receiveIds.join(','),
          checkUserIds: (formValue as unknown as { checkUserIds: string[]; }).checkUserIds.join(','),
          validBeginTime: formValue.beginTime,
          validEndTime: formValue.endTime,
          cronId: formValue.cronId === 'custom' ? '' : formValue.cronId,
          enable: 1
        }
        // 新增
        await cubeDailyInspectionService.createInspectTask(params)
        // 编辑
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
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      if (!id) return
      try {
        const res = await cubeDailyInspectionService.getInspectTaskDetail({ id })
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
            {
              route.query.type !== 'info' &&
                <div class={styles['edit-content']}>
                  <div class={styles.title}>基础信息</div>
                  <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
                  <div class={styles.title}>巡检内容</div>
                  <InspectContentTable dataSource={state.tableData} ref={patrolContentRef} />
                </div>
            }
          </>

        )
      },

      'footer-page': (): JSX.Element => {
        return (
          <Space>
            <Button onClick={() => {
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
