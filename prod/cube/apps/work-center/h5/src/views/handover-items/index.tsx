import { defineComponent, onMounted, reactive, ref } from 'vue'
import type { WorkTaskPageVO } from '@ghcloud/cube-work-center-service/src/type'
import styles from './index.module.less'
import { List, PullRefresh, Button, Empty } from 'vant'
import { cubeWorkCenterService } from '@/api/server'
import { RecordItem } from '../work-list/components/record-item/record-item'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { SearchBar } from '../work-list/components/search-bar/search-bar'
import { uniqBy } from 'lodash'
import { storeTodo } from '@/store/todo'
import { useGlobalRouter } from '@/hook/use-global-router'

// 选择交接事项
export const HandoverItems = defineComponent({
  setup: () => {
    const todoStore = storeTodo()
    const searchRef = ref<{ getFormState: () => Promise<Record<string, string>> }>()
    const page = {
      pageNumber: 1,
      pageSize: 10,
      pages: 0,
    }
    const state = reactive<{
      dataSource: WorkTaskPageVO[]
      refreshing: boolean
      finished: boolean
      checkedItems: string[]
      loading: boolean
      buttonLoading: boolean
      itemsCache: WorkTaskPageVO[]
    }>({
      dataSource: [],
      refreshing: false,
      finished: false,
      buttonLoading: false,
      checkedItems: [],
      loading: false,
      itemsCache: [],
    })

    const getHandoverItems = async (): Promise<{ total: number; records: WorkTaskPageVO[] }> => {
      const searchForm = await searchRef.value?.getFormState() ?? {}
      const res = await cubeWorkCenterService.getWorkTaskPage({
        ...page,
        ...searchForm,
        handover: true,
        taskStatus: 'TODO',
      })
      const { total, records } = res
      return { total, records: records as WorkTaskPageVO[] }
    }
    const onRefresh = (): void => {
      page.pageNumber = 0
      state.finished = false
      onLoad()
    }
    const onLoad = async (): Promise<void> => {
      try {
        state.loading = true
        page.pageNumber++
        const res = await getHandoverItems()
        if (page.pageNumber === 1) {
          state.dataSource = []
        }
        state.dataSource = [...state.dataSource, ...res.records]
        if (state.dataSource.length >= res.total || res.records.length === 0) {
          state.finished = true
        }
      } catch {
        state.finished = true
      } finally {
        state.loading = false
        state.refreshing = false
      }
    }
    const { router } = useGlobalRouter()
    const handleOk = async (): Promise<void> => {
      const list = [...state.dataSource, ...state.itemsCache].filter(item => state.checkedItems.includes(item?.id as unknown as string))
      const uniqueArray = uniqBy(list, 'id')
      state.checkedItems = uniqueArray.map(i => i.id) as string[]
      todoStore.checkItems = uniqueArray
      router.back()
    }
    onMounted(() => {
      const listCache = todoStore['checkItems'] ?? []
      state.itemsCache = uniqBy([...listCache], 'id') as WorkTaskPageVO[]
      if (state.itemsCache) state.checkedItems = state.itemsCache.map(i => i.id) as string[]
      state.dataSource.length = 0
      onRefresh()
    })
    const handleSearch = async (): Promise<void> => {
      state.dataSource.length = 0
      onRefresh()
    }
    const title = '选择交接事项'
    return (): JSX.Element => (
      <>
        <div class={styles.handoverItems}>
          <CubeNavBar title={title} showBack />
          <SearchBar ref={searchRef} onConfirm={handleSearch} />
          <PullRefresh v-model={state.refreshing} onRefresh={onRefresh} class={styles['list-pull-refresh']}>
            <List
              v-model:loading={state.loading}
              finished={state.finished}
              finished-text={state.dataSource.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                (state.dataSource && state.dataSource.length > 0)
                  ? state.dataSource.map((item: WorkTaskPageVO, index) =>
                    <div class={styles.checkboxWrap} >
                      <RecordItem
                        key={item.id ?? index}
                        record={item}
                        multiple
                        showCheckbox
                        checked={state.checkedItems}
                        onUpdate:checked={(val: string[]) => { state.checkedItems = val }}
                      />
                    </div>)
                  : <Empty description='暂无数据' />
              }
            </List>
          </PullRefresh>
          <div class={styles['operate']}>
            <div class={styles.operateTips}>
              已选：<span>{state.checkedItems.length}</span>项
            </div>
            <Button type="primary" size="small" loading-text="确定" loading={state.buttonLoading} onClick={handleOk}>
              确定
            </Button>
          </div>
        </div>
      </>
    )
  },
})