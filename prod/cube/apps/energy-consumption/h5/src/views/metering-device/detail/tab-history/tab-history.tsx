import { defineComponent, reactive, ref } from 'vue'
import './tab-history.less'
import { CellGroup, Empty, List, PullRefresh } from 'vant'
import { logger } from '@/logger'
import { cubeEnergyManagementService } from '@/api/server'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

interface ListItem {
  id: number;
  optTime: number;
  optUserName: string;
  initValue: string;
  changedDeviceValue: string;
}
export const TabHistory = defineComponent({
  setup () {
    const { deviceId } = useRoute().query as { id: string; deviceId: string; }
    const search = reactive({
      pageNumber: 0,
      pageSize: 10
    })
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<ListItem[]>([])
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()

    const getData = async (): Promise<{ total: number; records: ListItem[]; }> => {
      const params = {
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        deviceId: deviceId || '',
      }
      logger.debug(searchRef.value?.getFormState())
      const { total, records } = await cubeEnergyManagementService.getMeterDeviceChangeLogPage(params) as { total: number; records: ListItem[]; }
      return { total, records }
    }
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      dataSource.value.length = 0
      onLoad()
    }
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getData()
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
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    return () =>
      <div class='history'>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              dataSource.value.map(e => {
                return (
                  <CellGroup inset key={e.id} class='list-item'>
                    <div class='van-cell card-body'>
                      <div class='right'>
                        <div class='item'>更换时间：{e.optTime ? dayjs(e.optTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                        <div class='item'>操作人：{e.optUserName || '--'}</div>
                        <div class='item'>仪表初始读数：{e.initValue || '--'}</div>
                        <div class='item'>仪表最新读数：{e.changedDeviceValue || '--'}</div>
                      </div>
                    </div>
                  </CellGroup>
                )
              })
            }
          </List>
          {(dataSource.value?.length === 0) && <Empty style={{ backgroundColor: '#fff' }} description='暂无数据' />}
        </PullRefresh>
      </div>
  }
})
