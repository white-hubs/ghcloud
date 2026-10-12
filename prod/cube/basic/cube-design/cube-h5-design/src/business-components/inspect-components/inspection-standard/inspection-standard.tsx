import { Button, Cell, CellGroup, Checkbox, CheckboxGroup, Empty, List, PullRefresh, Search } from 'vant'
import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import type { StandardItemType, StandardVOS } from './type'
import { InspectionTask } from '../inspection-task/task'
import type { InspectionParams } from '../inspection-task/type'
export const InspectionStandard = defineComponent({
  emits: ['standards'],
  props: {
    options: {
      type: Object as PropType<{
        searchParams: InspectionParams;
        getListApi: (params?: Record<string, unknown>) => Promise<Record<string, unknown>>;
      }>,
      default: () => {
        return {}
      }
    },
    ids: {
      type: Array as PropType<string[]>,
      default: () => {
        return []
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  // 巡检标准
  setup (props, { emit }) {
    document.title = '巡检标准'
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
    })
    const inspectionTask = new InspectionTask<StandardVOS>({ ...props.options })
    const onLoad = async (): Promise<void> => {
      await inspectionTask.loadData()
    }
    const checkedStandard = ref<string[]>(props.ids)
    const checkboxRefs = ref<{ toggle: () => void;Element: Element; }[]>([])
    const cellDom = (item: { id: string; name: string; }, index: number): object => {
      return {
        'right-icon': () => <Checkbox disabled={props.ids.includes(item.id)} onClick={(e: Event) => {
          e.stopPropagation()
        }} name={item.id} ref={(el: { toggle: () => void;Element: Element; }) => {
          checkboxRefs.value[index] = el
        }} />
      }
    }
    const handleSubmit = (): void => {
      const list = inspectionTask.dataSource.filter((item) => {
        return checkedStandard.value.includes(item.id)
      }).filter(x => !props.ids.includes(x.id))
      list.forEach((x: { standardItems: StandardItemType[];tempAddFlag: boolean; }) => {
        x.tempAddFlag = true
        x.standardItems?.forEach(item => {
          item.isEditMore = item.remarkResult?.includes(item.resultItemValue) ?? false
          item.isUploadImage = item.imageResult?.includes(item.resultItemValue) ?? false
        })
      })
      emit('standards', list)
    }
    // 查询
    const onSearch = (val: InspectionParams): void => {
      Object.assign(search, { keyword: val })
      inspectionTask.updateSearchParams(search)
      inspectionTask.refreshData()
    }
    watch(() => props.show, () => {
      checkedStandard.value = props.ids
    })
    return (): JSX.Element =>
      <div>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' onSearch={onSearch} onClear={onSearch} />
        <PullRefresh v-model={inspectionTask.loadingStatus.refreshing} onRefresh={() => {
          inspectionTask.refreshData()
        }} style={{ height: 'calc(100vh - 110px)', overflow: 'auto' }}>
          <List
            v-model:loading={inspectionTask.loadingStatus.loading}
            finished={inspectionTask.loadingStatus.finished}
            finished-text={inspectionTask.dataSource.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <CheckboxGroup v-model={checkedStandard.value}>
              <CellGroup inset>
                {
                  inspectionTask.dataSource.map((item, index) =>
                    <Cell
                      title={item.name} clickable key={item.id} onClick={() => {
                        if (!props.ids.includes(item.id)) {
                          checkboxRefs.value[index].toggle()
                        }
                      }} v-slots={cellDom(item, index)}
                    />)
                }
              </CellGroup>
            </CheckboxGroup>
            {(inspectionTask.dataSource.length === 0 && inspectionTask.searchParams.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <Button block type='primary' onClick={handleSubmit}>确认</Button>
      </div>
  }
})
