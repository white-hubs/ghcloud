import { defineComponent, onMounted, reactive } from 'vue'
import { TransferSearchBar } from './components/transfer-search-bar/transfer-search-bar'
import { PersonList } from './components/person-list/person-list'
import { cubeOuaaService, cubeAlarmCenterService } from '../../../api/server'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import styles from './index.module.less'
import { List, PullRefresh, Button, showNotify } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import 'vant/es/notify/style'
import { useGlobalRouter } from '../../../hook/use-global-router'
export const AlarmTransfer = defineComponent({
  setup: () => {
    const { route, router } = useGlobalRouter()
    const page = {
      pageNumber: 1,
      pageSize: 10,
      pages: 0
    }
    const state = reactive<{
      dataSource: PersonItem[];
      refreshing: boolean;
      finished: boolean;
      checkedPerson: {
        userId: string;
        userName: string;
        departmentId: string;
        departmentName: string;
      };
      loading: boolean;
      buttonLoading: boolean;
      getDataState: {
        keyword: string;
        enabled: boolean;
        organizationId: string;
      };
    }>({
      dataSource: [],
      refreshing: false,
      finished: false,
      buttonLoading: false,
      checkedPerson: {
        userId: '',
        userName: '',
        departmentId: '',
        departmentName: ''
      },
      getDataState: {
        keyword: '',
        enabled: true,
        organizationId: ''
      },
      loading: false
    })

    const getPersonData = async (): Promise<{ total: number;records: PersonItem[]; }> => {
      const res = await cubeOuaaService.getStaffPage({ ...page, ...state.getDataState })
      const { total, records } = res
      return { total, records }
    }
    const onRefresh = (): void => {
      page.pageNumber = 0
      state.finished = false
      onLoad()
    }
    const onLoad = async (): Promise<void> => {
      try {
        // loading.value = true
        state.loading = true
        page.pageNumber++
        const res = await getPersonData()
        if (res.total <= page.pageSize) {
          state.finished = true
        }
        if (res.records.length < page.pageSize) {
          state.finished = true
        }
        if (page.pageNumber === 1) {
          state.dataSource = []
        }
        state.dataSource = [...state.dataSource, ...res.records]
      } catch {
        state.finished = true
      } finally {
        state.loading = false
        state.refreshing = false
      }
    }
    const handleTransfer = async (): Promise<void> => {
      try {
        state.buttonLoading = true
        await cubeAlarmCenterService.handleAlarmTransfer(route.query.id as string, state.checkedPerson)
        showNotify({ type: 'success', message: '移交成功' })
        router.back()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.buttonLoading = false
      }
    }
    const getData = (): void => {
      state.dataSource.length = 0
      onRefresh()
    }
    const handleSearchConfirm = (value: { keyword: string;selectedDeptOption: { text: string;value: string; }; }): void => {
      state.getDataState.keyword = value.keyword
      state.getDataState.organizationId = value.selectedDeptOption.value
      getData()
    }
    onMounted(() => {
      getData()
      document.title = '报警转交'
    })
    return (): JSX.Element => (
      <>
        <div class={styles.transfer}>
          <CubeNavBar showBack title='报警转交' />
          <TransferSearchBar onConfirm={handleSearchConfirm} />
          <PullRefresh v-model={state.refreshing} onRefresh={onRefresh} class={styles['person-list-pull-refresh']}>
            <List
              v-model:loading={state.loading}
              finished={state.finished}
              finished-text={state.dataSource.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              <PersonList dataList={state.dataSource} v-model:checked={state.checkedPerson} />
            </List>
          </PullRefresh>
          {state.checkedPerson.userId &&
            <div class={styles['transfer-operate']}>
              <Button round block type='primary' loading={state.buttonLoading} onClick={handleTransfer}>移交</Button>
            </div>}

        </div>
      </>
    )
  }
})
