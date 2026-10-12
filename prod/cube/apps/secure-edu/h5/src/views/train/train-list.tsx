import { List, Empty, PullRefresh, Cell, CellGroup, Search, Tabs, Tab, showDialog, showNotify } from 'vant'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import './train.less'
import { useRouter } from 'vue-router'
import { authStore } from '@/api/auth-store'
import { cubeSecureEduService, cubeSecureEduPublicService, cubeOuaaService } from '@/api/server'
import { CultivateMode, CultivateTaskStatus, UserSignStatus, type TrainType } from './type'
import { CubeAppBusinessBridge } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 培训任务列表页 */
export const TrainList = defineComponent({
  setup: () => {
    const router = useRouter()
    const dataSource = ref<TrainType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const keyword = ref('')
    const activeTab = ref('')
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const userId = ref('')
    onMounted(() => {
      getUser()
    })
    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {}
    }
    useMetaTitle()
    // 获取培训列表
    const getData = async (): Promise<{ records: TrainType[]; total: number; }> => {
      const params = {
        cultivateTaskStatus: activeTab.value !== 'ALL' ? activeTab.value : '',
        keyword: keyword.value,
        marketTenant: sessionStorage.getItem('marketTenant') ?? '',
      }
      const authenticated = Boolean(authStore.token)
      const { records, total } = authenticated
        ? await cubeSecureEduService.getCultivateTask(params)
        : await cubeSecureEduPublicService.getPublicCultivateTask({ ...search, ...params, userIdentify: localStorage.getItem('browserId') ?? '' })
      return {
        records,
        total
      }
    }
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getData()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
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
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const trainList = [
      { title: '全部', name: 'ALL' },
      { title: '待培训', name: 'PUBLISHED' },
      { title: '进行中', name: 'TRAINING' },
      { title: '已结束', name: 'OVER' }
    ]
    // 打卡签到

    const signIn = async (item: { cultivateTaskStatus: string; id: string; cultivateMode: string; userSignStatus: string; }): Promise<void> => {
      if (item.cultivateTaskStatus === 'OVER') {
        showDialog({
          message: '培训已结束',
          theme: 'round-button',
          confirmButtonColor: 'var(--van-primary-color)'
        })
        return
      }
      if (item.userSignStatus === 'SIGNED') {
        showDialog({
          message: '已签到！',
          theme: 'round-button',
          confirmButtonColor: 'var(--van-primary-color)'
        })
        return
      }
      if (getEnvironment() === 'cubeApp' && item.cultivateMode === 'OFFLINE') {
        // cultivateMode为线下时进行扫码，否则直接进入
        try {
          const code = await CubeAppBusinessBridge.handleBusinessScanCode()
          const authenticated = Boolean(authStore.token)
          const res = authenticated
            ? await cubeSecureEduService.getCultivateTaskDetail({ id: code ?? '' })
            : await cubeSecureEduPublicService.getPublicCultivateTaskDetail({ id: code ?? '' })
          if (res.cultivateUsers?.find(x => x.userId === userId.value)) {
            router.push({ path: '/train-sign-in', query: { id: code.toString() } })
          } else {
            showNotify({ type: 'danger', message: '无效二维码' })
            return
          }
        } catch (error) {
          showNotify({ type: 'danger', message: (error as { errorMessage?: string })?.errorMessage || '无效二维码' })
          return
        }
        router.push({ path: '/train-sign-in', query: { id: item.id } })
      }
      router.push({ path: '/train-sign-in', query: { id: item.id } })
    }
    // 进入详情

    const toDetail = (id?: string): void => {
      router.push({ path: '/train-detail', query: { id } })
    }
    return (): JSX.Element =>
      <div style={{ height: '100vh', background: '#f3f7fa', overflowY: 'scroll' }}>
        <CubeNavBar title='培训列表' showBack />
        <Search v-model={keyword.value} placeholder='请输入' onSearch={onSearch} />
        <Tabs v-model:active={activeTab.value} onChange={onSearch}>
          {
            trainList.map(item =>
              <Tab title={item.title} name={item.name} key={item.name}>
                <PullRefresh v-model={refreshing.value} onRefresh={onSearch}>
                  <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                    onLoad={onLoad}
                  >

                    {
                      dataSource.value && dataSource.value.length > 0 &&
                    dataSource.value.map((item: TrainType) => {
                      return (
                        <CellGroup inset class='train-cell-group' key={item.id}>
                          <Cell>
                            <div class='train-cell-title'>
                              <div class='name-status'>
                                <span class={['train-status', item.cultivateTaskStatus]}>{CultivateTaskStatus.get(item?.cultivateTaskStatus)}</span>
                                <span class='name'>{item.name}</span>
                              </div>
                              <div class='status' style={{ color: item?.userSignStatus === 'SIGNED' && !item?.belated ? '#3bc995' : '#dc362e' }}>{item?.userSignStatus === 'SIGNED' && item?.belated ? UserSignStatus.get('LATE') : UserSignStatus.get(item?.userSignStatus)}</div>
                            </div>
                          </Cell>
                          <Cell class='train-cell' onClick={() => {
                            toDetail(item.id)
                          }}>
                            <div class='train-cell-item'>
                              <label>培训形式：</label>
                              <span>{CultivateMode.get(item?.cultivateMode)}</span>
                            </div>
                            <div class='train-cell-item'>
                              <label>主讲人：</label>
                              <span>{item.speaker || '--'}</span>
                            </div>
                            <div class='train-cell-item'>
                              <label>截止时间：</label>
                              <span>{dayjs(item.cultivateEndTime).format('YYYY-MM-DD HH:mm')}</span>
                            </div>
                            <div class='train-cell-item'>
                              <label>培训地点：</label>
                              <span>{item.cultivateAddress}</span>
                            </div>
                          </Cell>
                          <Cell class='operate-cell'>
                            <div class='sign' onClick={() => {
                              signIn(item)
                            }}>打卡签到</div>
                          </Cell>
                        </CellGroup>
                      )
                    })
                    }
                    {/* {
                (dataSource.value && dataSource.value.length > 0) &&
                  dataSource.value.map((item: TrainType) =>
                    <CellGroup inset key={item.id} class='train-cell-group'>
                      <Cell>
                        <div class='train-cell-title'>
                          <span>{item.name}</span>
                          <div class='status'>
                            <div style={{ color: CultivateTaskColor.get(item?.cultivateTaskStatus) }}>{CultivateTaskStatus.get(item?.cultivateTaskStatus)}</div>
                            <div style={{ color: item?.userSignStatus === 'SIGNED' && !item?.belated ? '#3bc995' : '#dc362e' }}>
                              {item?.userSignStatus === 'SIGNED' && item?.belated ? UserSignStatus.get('LATE') : UserSignStatus.get(item?.userSignStatus)}
                            </div>
                          </div>
                        </div>
                      </Cell>
                      <Cell class='train-cell' onClick={() => { toDetail(item.id) }}>
                        <div>
                          <label>培训形式：</label>
                          <span>{CultivateMode.get(item?.cultivateMode)}</span>
                        </div>
                        <div>
                          <label>主讲人：</label>
                          <span>{item.speaker}</span>
                        </div>
                        <div>
                          <label>截止时间：</label>
                          <span>{dayjs(item.cultivateEndTime).format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                        <div>
                          <label>培训地点：</label>
                          <span>{item.cultivateAddress}</span>
                        </div>
                      </Cell>
                      <Cell>
                        <div style={{ color: '#169bd5', textAlign: 'center' }} onClick={() => { signIn(item) }}>打卡签到</div>
                      </Cell>
                    </CellGroup>
                  )
              } */}
                    {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                  </List>
                </PullRefresh>
              </Tab>)
          }
        </Tabs>
      </div>
  }
})
