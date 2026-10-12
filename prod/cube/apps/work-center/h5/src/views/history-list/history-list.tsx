import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Empty, PullRefresh, List, showNotify } from 'vant'
import styles from './history-list.module.less'
import { dayList, timeFormat } from '@/utils'
import { useRouter } from 'vue-router'
import { DateTabs } from './components/date-tabs/date-tabs'
import { RecordItem } from './components/record-item/record-item'
import { cubeWorkCenterService } from '@/api/server'
import type { TaskRecord } from '@ghcloud/cube-todo-center-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { SearchBar } from './components/search-bar/search-bar'
import dayjs from 'dayjs'
import { useTodoAction, type RecordTaskType } from '@/hook/use-todo-action'

export const HistoryList = defineComponent({
  setup () {
    const { handleClickItem } = useTodoAction()

    const month = ref('')
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dates = ref<{ day: string; week: string;value: string; }[]>([])
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      date: timeFormat(null, 'yyyy-MM-dd') ?? ''
    })
    const router = useRouter()
    const dataSource = ref<any[]>([])
    month.value = timeFormat(null, 'yyyy-MM') ?? ''
    dates.value = dayList(month.value)
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const getDataSource = async (): Promise<{ total: number; records: TaskRecord[]; }> => {
      try {
        const searchForm = searchRef.value?.getFormState() ?? {}
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          ...searchForm,
          period: `${search.date} 00:00:00` + ',' + `${search.date} 23:59:59`,
        }
        const { total, records } = await cubeWorkCenterService.getDoneTaskPage(params)
        return { total, records }
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
    })
    const checkedDate = async (val: string): Promise<void> => {
      search.date = val
 //  打印：2025-11-01 而非今日 2025-11-13
      getData()
    }
    const handleConfirmFilter = (): void => {
      getData()
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='工作记录' />
        <DateTabs 
          onChecked={(val) => {
            checkedDate(val)
          }} 
          defaultDate={dayjs().format('YYYY-MM-DD')}
        >
        <div class={styles.container}>
          <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['list-pull-refresh']}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                dataSource.value && dataSource.value.length > 0 &&
                dataSource.value.map((item) => {
                  return (
                    <RecordItem record={item} key={item.id} onClickRecord={() => {
                      handleClickItem(item as unknown as RecordTaskType)
                    }} />
                  )
                })
              }
              {(dataSource.value.length === 0 && !loading.value) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
        </DateTabs>
      </>
  }
})