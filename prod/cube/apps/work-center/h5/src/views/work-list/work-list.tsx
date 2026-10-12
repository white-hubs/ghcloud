import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, showNotify } from 'vant'
import { SearchBar } from './components/search-bar/search-bar'
import styles from './work-list.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import 'vant/es/notify/style'
import { useGlobalRouter } from '@/hook/use-global-router'
import { RecordItem } from './components/record-item/record-item'
import { cubeWorkCenterService, cubeOuaaService } from '@/api/server'
import type { WorkTaskPageVO } from '@ghcloud/cube-work-center-service/src/type'
import { useTodoAction, type RecordTaskType } from '@/hook/use-todo-action'

/** 工作中心 */
export const WorkList = defineComponent({
  name: 'WorkList',
  setup () {
    document.title = '工作中心'
    const { route } = useGlobalRouter()
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<WorkTaskPageVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const userId = ref('')
    const businessType = ref('')
    const getDataSource = async (): Promise<{ total: number; records: WorkTaskPageVO[]; }> => {
      try {
        const searchForm = await searchRef.value?.getFormState() ?? {}
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          ...searchForm
        }
        businessType.value = searchForm?.businessType
        const { total, records } = await cubeWorkCenterService.getWorkTaskPage(params)
        return { total, records: records as WorkTaskPageVO[] }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        return { total: 0, records: [] }
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
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      onRefresh()
    }
    onMounted(() => {
      getData()
      getUserId()
    })
    const getUserId = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {}
    }
    const handleConfirmFilter = (): void => {
      getData()
    }

    const { handleClickItem } = useTodoAction()

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='工作中心' />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['alarm-list-pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
                dataSource.value.map((item: WorkTaskPageVO, index) =>
                  <RecordItem key={index} record={item} userId={userId.value} businessType={businessType.value}
                    onClickRecord={() => {
                      handleClickItem(item as unknown as RecordTaskType, businessType.value)
                    }}
                  />)
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </>
  }
})
