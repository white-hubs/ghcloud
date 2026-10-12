import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Tabs, Tab, PullRefresh, List, Empty, showNotify, Button } from 'vant'
import { SearchBar } from './components/search-bar/search-bar'
import styles from './work-handover.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import 'vant/es/notify/style'
import { RecordItem } from './components/record-item/record-item'
import { cubeWorkCenterService } from '@/api/server'
import type { HandoverRecordVO } from '@ghcloud/cube-work-center-service/src/type'
import { useGlobalRouter } from '@/hook/use-global-router'
import { storeTodo } from '@/store/todo'

/** 工作交接 */
export const WorkHandover = defineComponent({
  name: 'WorkHandover',
  setup () {
    const todoStore = storeTodo()
    const { router } = useGlobalRouter()
    document.title = '工作交接'
    const tabActive = ref(0)
    const tabOptions = ref([
      { value: 'WAIT_HANDOVER', label: '待接班', num: '' },
      { value: 'HAND_TAKE', label: '交接班记录', num: '' },
    ])
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<HandoverRecordVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })

    const getDataSource = async (): Promise<{ total: number; records: HandoverRecordVO[]; }> => {
      try {
        const searchForm = searchRef.value?.getFormState() ?? {}
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          permission: true,
          status: tabOptions.value[tabActive.value].value,
          ...searchForm,
        }
        const { total, records } = await cubeWorkCenterService.getHandoverPage(params)
        return { total, records: records as HandoverRecordVO[] }
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
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
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

    const getData = (): void => {
      dataSource.value = []
      onRefresh()
    }

    onMounted(() => {
      getData()
    })

    const handleConfirmFilter = (): void => {
      getData()
    }
    const handleOver = (): void => {
      todoStore.checkItems = []
      todoStore.checkUsers = []
      router.push({ path: '/handover-form' })
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title={'工作交接'} rightSlot={() => <span style={{ color: '#1989fa'}} onClick={() => handleOver()}>交班</span>} />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <Tabs v-model:active={tabActive.value} sticky onChange={getData}>
          {
            tabOptions.value.map(item =>
              <Tab
                value={item.value}
                key={item.value}
                title={item.label}
              />)
          }
        </Tabs>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['handover-list-pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
                dataSource.value.map((item: HandoverRecordVO, index) =>
                  <RecordItem key={index} record={item} type={tabOptions.value[tabActive.value].value}/>)
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </>
  }
})