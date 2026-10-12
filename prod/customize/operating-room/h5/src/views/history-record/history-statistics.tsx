import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, showNotify } from 'vant'
import './history-statistics.less'
import { Legend } from '@/components/legend/legend'
import type { MedicalDeviceHistoryStatisticsVO } from '@ghcloud/cube-operating-room-service/src/types'
import { SearchBar } from './components/search-bar/search-bar'
import { StatisticItem } from './components/statistic-item/statistic-item'
import { cubeOperatingRoomService } from '@/api/server'

export const HistoryStatistics = defineComponent({
  setup () {
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const search = reactive({
      pageNumber: 0,
      pageSize: 10
    })
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<MedicalDeviceHistoryStatisticsVO[]>([])
    const handleSearch = async (): Promise<void> => {
      dataSource.value.length = 0
      onRefresh()
    }
    const getDataSource = async (): Promise<{ total: number; records: MedicalDeviceHistoryStatisticsVO[]; pages: number; }> => {
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          deviceName: searchRef.value?.getFormState().keyword,
          status: searchRef.value?.getFormState().status,
          period: searchRef.value?.getFormState().period,
        }

        const res = await cubeOperatingRoomService.getHistoryStatistics(params)
        const { total, records, pages } = res
        return { total, records, pages }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        return { total: 0, records: [], pages: 0 }
      }
    }
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }
    onMounted(() => {
      document.title = '历史统计'
      dataSource.value.length = 0
      onRefresh()
    })
    return (): JSX.Element =>
      <div class='list-page'>
        <SearchBar ref={searchRef} onConfirm={handleSearch} />
        <Legend />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class='real-list-pull-refresh'>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
              dataSource.value.map((item: MedicalDeviceHistoryStatisticsVO) =>
                <StatisticItem record={item} />)
            }
          </List>
          {(dataSource.value?.length === 0) && <Empty description='暂无数据' />}
        </PullRefresh>
      </div>
  }
})
