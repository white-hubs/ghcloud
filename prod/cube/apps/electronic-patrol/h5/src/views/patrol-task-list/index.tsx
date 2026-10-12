import { defineComponent, nextTick, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { Empty, List, PullRefresh, showNotify, Tab, Tabs, showLoadingToast, closeToast } from 'vant'
import { ListItem } from './list-item'
import { cubeElectronPatrolService } from '@/api/server'
import { SearchFilter } from '../components/search-filter/search-filter'
import type { ElectronTaskVo } from '@ghcloud/cube-electronic-patrol-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
interface StateProp {
  search: {
    keyword: string;
    period: string;
    pageNumber: number;
    pageSize: number;
    pages: number;
  };
  refreshing: boolean;
  loading: boolean;
  finished: boolean;
  finishedText: string;
  taskList: ElectronTaskVo[];
  activeTab: number;
  taskStatus: {
    key: string;
    value: number;
    text: string;
  }[];
}
export const Index = defineComponent({
  setup: () => {
    const state = reactive<StateProp>({
      search: {
        keyword: '',
        period: '',
        pageNumber: 1,
        pageSize: 10,
        pages: 0
      },
      refreshing: false,
      loading: false,
      finished: false,
      finishedText: '没有更多了',
      taskList: [],
      activeTab: 0,
      taskStatus: [
        {
          key: 'total',
          value: 0,
          text: '全部'
        },
        {
          key: 'toBeReceived',
          value: 0,
          text: '待接收'
        },
        {
          key: 'inExecution',
          value: 0,
          text: '执行中'
        },
        {
          key: 'finished',
          value: 0,
          text: '已结束'
        },
      ]
    })
    onMounted(() => {
      document.title = '巡更任务'
      getStatusStat()
      getList()
    })
    const tabStatus = ['', 'TO_BE_RECEIVED', 'IN_EXECUTION', 'FINISHED']
    const getList = async (): Promise<void> => {
      try {
        showLoadingToast({
          message: '加载中...'
        })
        const params = {
          ...state.search,
          period: state.search.period,
          taskState: tabStatus[state.activeTab], // state.taskStatus[state.activeTab].key,
        }

        const result = await cubeElectronPatrolService.getElectronTaskList(params)
        state.taskList = state.search.pageNumber === 1 ? [...result.records] : [...state.taskList, ...result.records]
        state.search.pages = result.pages
        nextTick(() => {
          closeToast()
        })
        if (result.pages >= state.search.pageNumber) {
          state.finishedText = state.search.pageNumber > 1 ? '没有更多了' : ''
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const getStatusStat = async (): Promise<void> => {
      const result = await cubeElectronPatrolService.getElectronTaskOverview()
      state.taskStatus = state.taskStatus.map(item => {
        return {
          ...item,
          value: result[item.key]
        }
      })
    }
    const handleNextPage = async (): Promise<void> => {
      if (state.search.pageNumber >= state.search.pages) {
        state.finished = true
        return
      }
      state.search.pageNumber++
      await getList()
      state.loading = false
    }
    const handleChangeTab = (): void => {
      state.search.pageNumber = 1
      getList()
    }
    const handleSearch = (search: {
      keyword: string;
      period: string;
    }): void => {
      state.search.pageNumber = 1
      state.search.keyword = search.keyword
      state.search.period = search.period
      getList()
    }
    const handleRefresh = async (): Promise<void> => {
      state.search.pageNumber = 1
      await getList()
      state.finished = false
      state.loading = false
      state.refreshing = false
    }
    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title='巡更任务' />
        <div class={styles.container}>
          <SearchFilter placeholder='根据巡更任务名称进行搜索' onConfirm={handleSearch} />
          <Tabs v-model:active={state.activeTab} onChange={handleChangeTab}>
            {state.taskStatus.map(item => {
              return <Tab title={`${item.text + item.value}`} key={item.key} />
            })}
          </Tabs>
          <PullRefresh v-model={state.refreshing} class={styles.pullRefresh} onRefresh={handleRefresh}>
            <List class={styles.list} v-model:loading={state.loading} finishedText={state.finishedText} finished={state.finished} onLoad={handleNextPage} immediateCheck={false}>
              {state.taskList.length !== 0 && state.taskList.map(item => {
                return <ListItem taskVo={item} key={item.id} onGetList={getList} />
              })}
              {!state.taskList.length && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </>
    )
  }
})
