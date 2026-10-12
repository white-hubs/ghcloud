import { defineComponent, ref, reactive } from 'vue'
import { List, PullRefresh, Empty, Checkbox, CheckboxGroup } from 'vant'
import { cubeMdataService } from '../../../api/service'
import type { StallPage } from '@ghcloud/cube-mdata-service'
import styles from './base-select-popup/base-select-popup.module.less'

interface StallListSelectProps {
  value: string[];
  selectedItems?: StallPage[];
  multiple?: boolean;
}

export const StallListSelect = defineComponent({
  props: ['value', 'selectedItems', 'multiple'],
  emits: ['update:value', 'update:selectedItems', 'select'],
  setup (props: StallListSelectProps, { emit, expose }) {
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: ''
    })

    const dataSource = ref<StallPage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeMdataService.stallPage(search)
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
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const handleSearch = (keyword: string): void => {
      finished.value = false
      search.keyword = keyword
      search.pageNumber = 0
      dataSource.value = []
      onLoad()
    }
    const toggle = (item: StallPage): void => {
      let newIds: string[] = [...props.value]
      let newItems: StallPage[] = [...(props.selectedItems || [])]

      if (!props.multiple) {
        newIds = [item.id]
        newItems = [item]
      } else {
        const index = props.value.findIndex(id => id === item.id)
        if (index === -1) {
          newIds.push(item.id)
          newItems.push(item)
        } else {
          newIds.splice(index, 1)
          newItems.splice(index, 1)
        }
      }
      emit('update:value', newIds)
      emit('update:selectedItems', newItems)
      emit('select', { ids: newIds, items: newItems })
    }
    const clearSelection = (): void => {
      emit('update:value', [])
      emit('update:selectedItems', [])
      emit('select', { ids: [], items: [] })
    }

    expose({
      clearSelection,
      handleSearch
    })

    return (): JSX.Element =>
      <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['list-pull-refresh']} style={{ height: props.multiple ? 'calc(100vh - 210px)' : 'calc(100vh - 150px)' }}>
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
          onLoad={onLoad}
        >
          {dataSource.value.length > 0 && dataSource.value.map((item, index) =>
            <CheckboxGroup key={index} modelValue={props.value} shape={props.multiple ? 'square' : ''}>
              <div class={styles["cell-group"]} onClick={() => toggle(item)}>
                <div class={styles["title"]}>
                  <span class={styles["title-name"]}>
                    {item.code}
                  </span>
                  <Checkbox name={item.id} />
                </div>
                <div class={styles.content}>
                  <div><span class={styles.label}>档位名称：</span><span>{item.name}</span></div>
                  <div><span class={styles.label}>档位类型：</span><span>{item.typeName}</span></div>
                  <div><span class={styles.label}>档位区域：</span><span>{item.areaNames}</span></div>
                </div>
              </div>
            </CheckboxGroup>)}
          {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
        </List>
      </PullRefresh>
  }
})