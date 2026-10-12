import { Button, Cell, CellGroup, Checkbox, CheckboxGroup, Empty, List, PullRefresh, Search } from 'vant'
import { defineComponent, reactive, ref, watch, type PropType, type VNode, } from 'vue'
import { cubeDailyInspectionService } from '@/api/server'
import type { StandardItemType, StandardVOS } from '@ghcloud/cube-daily-inspection-service'
export const CopyList = defineComponent({
  emits: ['standards'],
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          targetCategory: '',
          targetType: ''
        }
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
  setup (props, { emit }) {
    document.title = '选择巡检对象'
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
      flagDetails: true,
    })
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const concatList = ref<StandardVOS[]>([])
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.InspectStandardPage({
          targetCategory: props.params.targetCategory,
          targetType: props.params.targetType,
          ...search
        })
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!concatList.value) {
          concatList.value = []
        }
        if (search.pageNumber === 1) {
          concatList.value = []
        }
        concatList.value = [...concatList.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
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
      const list = concatList.value.filter((item) => {
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
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }
    watch(() => props.show, () => {
      checkedStandard.value = props.ids
      onSearch()
    })
    return (): VNode=>
      <div>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' onSearch={onSearch} onClear={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: 'calc(100vh - 110px)', overflow: 'auto' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={concatList.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <CheckboxGroup v-model={checkedStandard.value}>
              <CellGroup inset>
                {
                  concatList.value.map((item, index) =>
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
            {(concatList.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <Button block type='primary' onClick={handleSubmit}>确认</Button>
      </div>
  }
})
