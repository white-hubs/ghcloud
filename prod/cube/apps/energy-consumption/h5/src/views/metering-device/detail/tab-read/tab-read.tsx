import { defineComponent, reactive, ref } from 'vue'
import { CellGroup, Empty, List, PullRefresh } from 'vant'
import { logger } from '@/logger'
import './tab-read.less'
import { cubeEnergyManagementService } from '@/api/server'
import type { MeterReadLog } from '@ghcloud/cube-energy-consumption-service'
import { useRoute } from 'vue-router'

export const TabRead = defineComponent({
  setup () {
    const { deviceId } = useRoute().query as { id: string; deviceId: string; }
    const search = reactive({
      pageNumber: 0,
      pageSize: 10
    })
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<MeterReadLog[]>([])
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()

    const getData = async (): Promise<{ total: number; records: MeterReadLog[]; }> => {
      const params = {
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        deviceIds: deviceId || '',
      }
      logger.debug(searchRef.value?.getFormState())
      const { total, records } = await cubeEnergyManagementService.getMeterReadLogPage(params)
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
              dataSource.value.map((e, i) => {
                return (
                  <CellGroup inset key={i} class='list-item'>
                    <div class='van-cell card-body'>
                      <div class='right'>
                        <div class='item'>采集时间：{e.curDateTime || '--'}</div>
                        <div class='item'>设备读数：{e.readValue || '--'}</div>
                        <div class='item'>本期用量：{e.usage || '--'}</div>
                        <div class='item'>采集方式：{e.collectType === 'auto' ? '自动' : '手动'}</div>
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
