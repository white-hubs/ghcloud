import { defineComponent, onMounted, reactive, ref } from 'vue'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import styles from './index.module.less'
import { List, PullRefresh, Button } from 'vant'
import { cubeOuaaService } from '@ghcloud/cube-app-generic-component/src/api/server'
import { PersonList } from './components/person-list/person-list'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { SearchBar, type PersonRouteQuery } from './components/search-bar/search-bar'
import { uniqBy } from 'lodash'
import { useRouter } from 'vue-router'
import { storeMeet } from '@/store/meet'
export const PersonPage = defineComponent({
  setup: () => {
    const meetStore = storeMeet()
    const searchRef = ref<{ getFormState: () => PersonRouteQuery; }>()
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
      personListCache: PersonItem[];
    }>({
      dataSource: [],
      refreshing: false,
      finished: false,
      buttonLoading: false,
      checkedUser: [],
      loading: false,
      personListCache: []
    })

    const getPersonData = async (): Promise<{ total: number;records: PersonItem[]; }> => {
      const { organizationId, keyword, roleId, positionId } = searchRef.value?.getFormState() ?? {}
      const res = await cubeOuaaService.getStaffPage({
        ...page,
        enabled: true,
        organizationId,
        keyword,
        roleId,
        positionId
      })
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
    const router = useRouter()
    const handleOk = async (): Promise<void> => {
      const list = [...state.dataSource, ...state.personListCache].filter(item => state.checkedUser.includes(item.id))
      const uniqueArray = uniqBy(list, 'id')
      state.checkedUser = uniqueArray.map((i: { id: string; }) => i.id)
      meetStore['checkUsers'] = uniqueArray
      router.back()
    }
    onMounted(() => {
      const listCache = meetStore['checkUsers'] ?? []
      state.personListCache = uniqBy([...listCache], 'id') as PersonItem[]
      if (state.personListCache) state.checkedUser = state.personListCache.map((i: { id: string; }) => i.id)
      state.dataSource.length = 0
      onRefresh()
    })
    const handleSearch = async (): Promise<void> => {
      state.dataSource.length = 0
      onRefresh()
    }
    return (): JSX.Element => (
      <>
        <div class={styles.person}>
          <CubeNavBar title='选择人员' showBack />
          <SearchBar ref={searchRef} onConfirm={handleSearch} />
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
          <div class={styles['person-operate']}>
            <div class={styles.operateTips}>
              已选：<span>{state.checkedUser.length}</span>人
            </div>
            <Button type='primary' size='small' loading-text='确定' loading={state.buttonLoading} onClick={handleOk}>确定</Button>
          </div>

        </div>
      </>
    )
  }
})
