import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, Cell, SwipeCell, Button, Dialog, showNotify, showConfirmDialog } from 'vant'
import styles from './black-list.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeParkingLotService } from '@/api/server'
import type { IllegalParkingBlacklistVO } from '@ghcloud/cube-parking-lot-service/src/type'
import dayjs from 'dayjs'
import { SearchBar } from "./search-bar/search-bar";
import { useGlobalRouter } from '@/hook/use-global-router'

export const BlackList = defineComponent({
  name: 'BlackList',
  setup () {
    document.title = '黑名单'
    const { router } = useGlobalRouter()
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<IllegalParkingBlacklistVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 0,
      pageSize: 10
    })

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const formState = searchRef.value?.getFormState() ?? {}
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          ...formState
        }
        const res = await cubeParkingLotService.getParkingBlackList(params)
        search.total = res.total
        
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
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

    const handleDelete = async (item: IllegalParkingBlacklistVO) => {
      showConfirmDialog({
        title: '提示',
        message: '确认移除该黑名单吗？',
      })
        .then(async () => {
          await cubeParkingLotService.deleteParkingBlack(String(item.id))
          onRefresh()
        })
        .catch(() => {
        });
    }

    const handleAdd = (): void => {
      router.push({ path: '/add-blacklist' })
    }

    const handleToDetail = (item: IllegalParkingBlacklistVO): void => {
        router.push({ path: '/blacklist-detail', query: { id: item.id, plateNumber: item.plateNumber } })
    }

    const handleConfirmFilter = (): void => {
      onRefresh()
    }

    onMounted(() => {
      onRefresh()
    })

    return (): JSX.Element => (
      <div class={styles['black-list']}>
        <CubeNavBar showBack title={'黑名单'} rightSlot={() => <span style={{ color: '#1989fa'}} onClick={() => handleAdd()}>新增</span>} />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <div class={styles['black-list-cell-group']}>
              {dataSource.value.map((item, index) => (
                <div key={item.id ?? index} class={styles['black-list-card']}>
                    <SwipeCell right-width={65} v-slots={{
                        right: () => (
                            <Button square type="danger" text="移除" class={styles['delete-button']} onClick={() => handleDelete(item)} />
                        )
                    }}>
                        <div onClick={() => handleToDetail(item)}>
                            <Cell
                                is-link
                                center
                                v-slots={{
                                    title: () => (
                                        <div class={styles['black-list-cell-title']}>
                                            <span class={styles.text}>{item.plateNumber || '--'}</span>
                                        </div>
                                    )
                                }}
                            />
                            <div class={styles['black-list-cell-content']}>
                                <div class={styles['info-item']}>
                                    <span>车主：{item.owner || '--'}</span>
                                </div>
                                <div class={styles['info-item']}>
                                    <span>联系方式：{item.phone || '--'}</span>
                                </div>
                                <div class={styles['info-item']}>
                                    <span>加入黑名单时间：{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                                </div>
                                <div class={styles['info-item']}>
                                    <span>加入黑名单原因：{item.reason || '--'}</span>
                                </div>
                                <div class={styles['info-item']}>
                                    <span>违停扣分：{ item.violationScore ? `${item.violationScore}分` : '--' }</span>
                                </div>
                            </div>
                        </div>
                    </SwipeCell>
                </div>
              ))}
            </div>
            {(dataSource.value.length === 0 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </div>
    )
  }
})
