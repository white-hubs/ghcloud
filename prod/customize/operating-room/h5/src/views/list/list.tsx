import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Search, PullRefresh, List, Empty, CellGroup, Cell } from 'vant'
import './list.less'
import { useRouter } from 'vue-router'
import { Legend } from '@/components/legend/legend'
import { DevicePropStatus, type RealTimeMonitorVO } from '@ghcloud/cube-operating-room-service/src/types'
import { cubeOperatingRoomService } from '@/api/server'
import { intToRoman } from '@/hook/use-utils'

export const ListPage = defineComponent({
  setup () {
    const router = useRouter()
    const searchParam = reactive({
      areaId: '',
      keyword: '',
      pageNumber: 0,
      pageSize: 10
    })
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<RealTimeMonitorVO[]>([])
    const handleSearch = (): void => {
      searchParam.pageNumber = 0
      finished.value = false
      dataSource.value.length = 0
      onLoad()
    }
    const onRefresh = (): void => {
      searchParam.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        searchParam.pageNumber++
        const params = { ...searchParam }
        const res = await cubeOperatingRoomService.getTimePage(params)
        if (searchParam.pageNumber >= res.pages) {
          finished.value = true
        }
        if (searchParam.pageNumber === 1) {
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
    onMounted(() => {
      document.title = '医疗洁净业务监测'
      dataSource.value.length = 0
    })
    return (): JSX.Element =>
      <div class='list-page'>
        <Search
          shape='round' v-model={searchParam.keyword} placeholder='手术室名称' onSearch={handleSearch} onClear={handleSearch}
          show-action
          v-slots={{
            action: () =>
              <>
                <div onClick={handleSearch}>搜索</div>
              </>
          }}
        />
        <Legend />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
              dataSource.value.map(e => {
                return (
                  <CellGroup inset key={e.id} class='list-item'>
                    <Cell
                      title={e.operatingRoomName} is-link value='更多' onClick={() => {
                        router.push({ path: '/detail', query: { id: e.id } })
                      }}
                    />
                    <div class='van-cell card-body'>
                      <div class={['left']}>
                        <span>洁净等级</span>
                        <span>{intToRoman(e.details?.find(e => e.normCode === 'cleanlinessLevel')?.value || 0)}</span>
                      </div>
                      <div class='right'>
                        {

                          e.details && e.details?.length > 0 && e.details.filter(f => f.showArea === '1').sort((a, b) => a.sort ?? 0 - (b.sort ?? 0))?.map((e) => {
                            return (
                              <div
                                key={e.normName} class={['item',
                                  Number(e.display) === 1 ? 'show' : 'hide',
                                  e.status === DevicePropStatus.NORMAL ? 'normal' : e.status === DevicePropStatus.LOWER_LIMIT ? 'low' : e.status === DevicePropStatus.UPPER_LIMIT ? 'high' : 'normal']}
                              >
                                <span>{e.normName}</span>
                                <span>{e?.value ?? '--'}{e.unit}</span>
                              </div>
                            )
                          })
                        }
                        {
                          e.details && e.details?.length === 0 && <Empty style='width: 100%' description='暂无数据' />
                        }
                      </div>
                    </div>
                  </CellGroup>
                )
              })
            }
          </List>
          {(dataSource.value?.length === 0) && <Empty description='暂无数据' />}
        </PullRefresh>
      </div>
  }
})
