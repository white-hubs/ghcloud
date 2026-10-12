import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './patrol-plan-edit.module.less'
import { BasicInfo } from './components/basic-info'
import { PatrolContentTable, type DataSourceType } from '../../components/patrol-content-table'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import { scheduledetail } from '@/api/supervise'
import dayjs from 'dayjs'
const createType = ['create', 'copy']
export const PatrolPlanEdit = defineComponent({
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
        info: '巡检计划详情',
        edit: '编辑巡检计划',
        create: '新增巡检计划',
        copy: '新增巡检计划'
      }
      return titleType[route.query.type as unknown as keyof typeof titleType | 'create'] ?? '新增巡检计划'
    })
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> ; }>()
    const patrolContentRef = ref<{ getApiParams: () => unknown[]; }>()
    const handleSubmit = async (): Promise<void> => {
      const type = route.query.type as string
      const formValue = await basicInfoRef.value?.handleSubmit() as Record<string, string>
      const planRelationList = patrolContentRef.value?.getApiParams()
      const strandList = planRelationList?.filter((item) => (item as Record<string, string>).standardId)
      if (!planRelationList?.length) {
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
          planRelationList,
          receiveIds: (formValue as unknown as { receiveIds: string[]; }).receiveIds.join(','),
          validBeginTime: formValue.beginTime,
          validEndTime: formValue.endTime,
          selection: (formValue as unknown as { selection: string[]; }).selection?.join(','),
          cronId: formValue.cronId === 'custom' ? '' : formValue.cronId,
          enable: 1,
          businessType: InspectBusinessType.SMALL_ENGINEERING,
          id: createType.includes(type) ? '' : formValue.id
        }
        // 新增
        if (createType.includes(type)) {
          await cubeDailyInspectionService.createInspectPlan(params)
        } else {
        // 编辑
          await cubeDailyInspectionService.updateInspectPlan(params)
        }
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
      getProjectDetail()
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      const type = route.query.type as string
      if (!id) return
      try {
        const res = await cubeDailyInspectionService.getInspectPlanDetail({ id, businessType: InspectBusinessType.SMALL_ENGINEERING })
        state.tableData = (res.typeTargets as unknown[]).flat() as DataSourceType[]
        state.formState = {
          ...res,
          name: type === 'copy' ? res.name + '-副本-' + dayjs().format('YYYY-MM-DD') : res.name,
          selection: res.selection ? (res.selection as string)?.split(',') : null,
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }
    const getProjectDetail = async (): Promise<void> => {
      const objectId = route.query.objectId as string
      if (!objectId) return
      const { data } = await scheduledetail(objectId)

      const name = data.projectName
      const durationTime = data.duration ? data.duration.split(',') : []
      const receiveIds = data.superviseUser.map(item=>item.id).join(',')
      const receiveType = '1'
      const validBeginTime = durationTime[0] ? dayjs(durationTime[0]).format('YYYY-MM-DD HH:mm:ss') : null
      const validEndTime = durationTime[1] ? dayjs(durationTime[1]).format('YYYY-MM-DD 23:59:59') : null
      state.formState = {
        ...state.formState,
        name,
        receiveIds,
        receiveType,
        validBeginTime,
        validEndTime,
        limitTimeJson: '',
        cycle: false,
      }
      const standards = await cubeDailyInspectionService.getInspectStandard({
        targetCategory: 'SMALL_ENGINEERING',
        targetType: data.projectType,
        businessType: InspectBusinessType.SMALL_ENGINEERING
      })
      const patrolObjStandard = standards.map((item) => {
        return {
          code: item.code,
          describe: item.remark,
          enable: item.enable,
          id: item.id,
          name: item.name,
          standardItems: item.standardItems.map(item=>{
            return {
              isRawItem: 1,
              content: '',
              ...item
            }
          })
        }
      })
      const patrolObjects = [{
        targetId: data.id,
        targetName: data.projectName,
        targetTypeName: data.projectTypeName ?? '',
        standardDTOList: patrolObjStandard,
        targetCategory: 'SMALL_ENGINEERING',
        targetCode: data.projectNum ?? '',
        targetType: data.projectType ?? '',
        depName: data.depName ?? '',
        targetParentId: '',
        location: '',
        latAndLon: '',
        areaName: '',
        areaId: '',
        address: ''
      }]
      state.tableData = patrolObjects
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles['edit-content']}>
            <div class={styles.title}>基础信息</div>
            <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
            <div class={styles.title}>巡检内容</div>
            <PatrolContentTable dataSource={state.tableData} ref={patrolContentRef} />
          </div>
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
