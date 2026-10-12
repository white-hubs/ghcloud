import { defineComponent, onMounted, reactive } from 'vue'
import { TransferSearchBar } from '../components/transfer-search-bar/transfer-search-bar'
import { PersonList } from '../components/person-list/person-list'
import { cubeOuaaService, cubeElectronPatrolService } from '../../../api/server'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import styles from './index.module.less'
import { useRoute, useRouter } from 'vue-router'
import { List, PullRefresh, Button, showNotify } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
export const AddCollaboration = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const page = {
      pageNumber: 1,
      pageSize: 10,
      pages: 0
    }
    const state = reactive<{
      dataSource: PersonItem[];
      refreshing: boolean;
      finished: boolean;
      checkedUser: string[];
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
      checkedUser: [],
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
    const handleAddCollaborator = async (): Promise<void> => {
      if (!state.checkedUser.length) {
        showNotify({ type: 'danger', message: '请选择协同人' })
        return
      }
      try {
        state.buttonLoading = true
        await cubeElectronPatrolService.addElectronTaskCooperate({
          taskId: route.query.taskId as string,
          userId: state.checkedUser.join(',')
        })
        showNotify({
          type: 'success',
          duration: 1000,
          message: '添加成功',
          onClose: () => {
            router.back()
          }
        })
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
      const users = route.query.cooperateUsers as string
      if (!users) return
      state.checkedUser = users.split(',')
    })
    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title={route.meta.title} />
        <div class={styles.transfer}>
          <TransferSearchBar onConfirm={handleSearchConfirm} />
          <PullRefresh v-model={state.refreshing} onRefresh={onRefresh} class={styles['person-list-pull-refresh']}>
            <List
              v-model:loading={state.loading}
              finished={state.finished}
              finished-text={state.dataSource.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              <PersonList dataList={state.dataSource} multiple v-model:checked={state.checkedUser} />
            </List>
          </PullRefresh>
          <div class={styles['transfer-operate']}>
            <div class={styles.operateTips}>
              已选：<span>{state.checkedUser.length}</span>人
            </div>
            <Button type='primary' size='small' loading-text='添加协同人' loading={state.buttonLoading} onClick={handleAddCollaborator}>添加协同人</Button>
          </div>

        </div>
      </>
    )
  }
})
