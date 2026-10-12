import { defineComponent, reactive, ref } from 'vue'
import { cubeMaintainService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectionRecordList as List } from '@ghcloud/cube-h5-design'
import { SearchForm } from './search-form'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { InspectionParams } from '../type'

/** 日常巡检-我的巡检 */
export const InspectionRecordList = defineComponent({
  setup: () => {
    const route = useRoute()
    const inspectionRef = ref()
    const showRight = ref(false)
    const businessType = route.query.businessType as string ?? 'SMALL_ENGINEERING'
    const searchParams = reactive<InspectionParams>({
      period: '',
      result: (route.query.type as string) ?? '',
      status: '',
      targetCategory: '',
      keyword: '',
      startTime: '',
      endTime: '',
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const onReset = (): void => {
      searchParams.targetCategory = ''
      searchParams.result = ''
      searchParams.status = ''
      searchParams.endTime = ''
      searchParams.startTime = ''
      searchParams.period = ''
    }
    const onSubmit = (): void => {
      inspectionRef.value.onSearch()
    }
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', minHeight: '100vh' }}>
        <CubeNavBar title='巡检记录' rightText='筛选' onClickRight={() => {
          showRight.value = true
        }} />
        <List
          ref={inspectionRef}
          options={{
            searchParams,
            // 列表数据
            getListApi: async (val?: InspectionParams) => {
              const query = val as {
                pageNumber: number;
                pageSize: number;
                keyword: string;
                result: string;
                taskIds?: string;
                userId?: string;
                status: string;
                period: string;
              }
              return cubeMaintainService.getInspectRecord({ ...query, businessType })
            },
          }}
        />
        <SearchForm
          v-model:search={searchParams}
          v-model:show={showRight.value}
          onOnUpdate:show={() => {
            showRight.value = false
          }}
          onReset={onReset}
          onSubmit={onSubmit}
        />
      </div>
  }
})
