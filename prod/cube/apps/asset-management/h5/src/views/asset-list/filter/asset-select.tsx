import { cubeAssetManagementService } from '@/api/server'
import type { AssetClassifyType } from '@ghcloud/cube-asset-management-service'
import { List, Empty, PullRefresh, Cell, CellGroup, Search, RadioGroup, Radio, Button } from 'vant'
import { defineComponent, reactive, ref, watch } from 'vue'

/** 资产列表页 */
export const AssetSelect = defineComponent({
  emits: ['submit'],
  props: {
    assetType: {
      type: String,
      default: 'assetType'
    }
  },
  setup: (props, { emit }) => {
    const dataSource = ref<AssetClassifyType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const checked = reactive({
      id: '',
      name: ''
    })
    const search = reactive({
      name: '',
      type: props.assetType,
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    // 获取资产列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeAssetManagementService.getAssemblyClassifyPage({ ...search })
        search.total = res.total

        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
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
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const handleCheck = (item: { id: string;name: string; }): void => {
      checked.id = item.id
      checked.name = item.name
    }
    const handleClick = (): void => {
      emit('submit', checked)
    }
    watch(() => props.assetType, () => {
      dataSource.value = []
      checked.id = ''
      checked.name = ''
      search.type = props.assetType
      onSearch()
    }, { immediate: true })
    return (): JSX.Element =>
      <div>
        <Search v-model={search.name} placeholder='根据名称进行搜索' onSearch={onSearch} />
        <div style={{ height: '89vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '89vh', overflow: 'auto' }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              <RadioGroup v-model={checked.id} style='padding:3vw 0'>
                <CellGroup>
                  {
                    dataSource.value && dataSource.value.length > 0 &&
                    dataSource.value.map((item) => {
                      return (
                        <Cell title={item.name} key={item} clickable onClick={() => {
                          handleCheck(item)
                        }} v-slots={{ 'right-icon': () => <Radio name={item.id} /> }} />
                      )
                    })
                  }
                  {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' style='background:#f3f7fa' />}
                </CellGroup>
              </RadioGroup>
            </List>
          </PullRefresh>
        </div>
        <Button type='primary' block size='small' onClick={handleClick}>确定</Button>
      </div>
  }
})
