import { defineComponent, onMounted, reactive, ref } from 'vue'
import './list.less'
import { useRouter } from 'vue-router'
import { CellGroup, Empty, List, PullRefresh, Image } from 'vant'
import { logger } from '@/logger'
import { SearchBar } from '../components/search-bar/search-bar'
import { cubeEnergyManagementService } from '@/api/server'
import dayjs from 'dayjs'

interface ListItem {
  id?: number;
  deviceAreaName?: string;
  deviceId?: string;
  deviceName?: string;
  readeValue?: number;
  parentName?: string;
  productCategoryName?: string;
  productBrandName?: string;
  productName?: string;
  lastNum?: number;
  lastReadeTime?: number;
  lastReadeValue?: number;
  nowNum?: number;
  nowReadeTime?: number;
  nowReadeValue?: number;
  initValue?: number;
  instrumentName?: string;
  instrumentType?: string;
  fileVOS?: { id: string; name: string; path: string; }[];
}
export const ListPage = defineComponent({
  setup () {
    const router = useRouter()
    const search = reactive({
      keyword: '',
      pageNumber: 0,
      pageSize: 10
    })
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<ListItem[]>([])
    const searchRef = ref<{ getFormState: () => { keyword: string;typeId: string;areaIds: string; }; }>()

    const getData = async (): Promise<{ total: number; records: ListItem[]; }> => {
      const params = {
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        deviceAreaId: searchRef.value?.getFormState()?.areaIds || '',
        keyword: searchRef.value?.getFormState()?.keyword || '',
        instrumentType: searchRef.value?.getFormState()?.typeId || ''
      }
      logger.debug(searchRef.value?.getFormState())
      const { total, records } = await cubeEnergyManagementService.getMeterDevicePage(params) as { total: number; records: ListItem[]; }
      return { total, records }
    }
    const handleSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      dataSource.value.length = 0
      onLoad()
    }
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
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
        refreshing.value = false
        loading.value = false
      }
    }
    onMounted(() => {
      document.title = '计量设备'
      dataSource.value.length = 0
    })
    return () =>
      <div class='list-page'>
        <SearchBar ref={searchRef} onConfirm={handleSearch} />
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
                    <div class='van-cell card-body' onClick={() => { router.push({ path: '/metering-device-detail', query: { id: e.id, deviceId: e.deviceId } }) }}>
                      <div class='left'>
                        <Image class='img' src={e.fileVOS && e.fileVOS.length > 0 ? e.fileVOS[0].path : ''}>
                          <template v-slot:error>加载失败</template>
                        </Image>
                      </div>
                      <div class='right'>
                        <div class='item title'>
                          <div class='name'>{e.deviceName || '--'}</div>
                          <div class='value'>{e.readeValue || '--'}</div>
                        </div>
                        <div class='item'>所属区域：{e.deviceAreaName || '--'}</div>
                        <div class='item'>最新采集时间：{e.nowReadeTime ? dayjs(e.nowReadeTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                        <div class='item'>初始读数：<em>{e.initValue || '--'}</em></div>
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
