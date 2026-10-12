import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, showNotify, Cell, Image, showImagePreview } from 'vant'
import styles from './access-record.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeParkingLotService } from '@/api/server'
import type { ParkingAccessRecordsVO } from '@ghcloud/cube-parking-lot-service/src/type'
import { AccessType } from '@ghcloud/cube-parking-lot-service/src/type'
import dayjs from 'dayjs'
import { SearchBar } from "./search-bar/search-bar";

export const AccessRecord = defineComponent({
  name: 'AccessRecord',
  setup () {
    document.title = '出入记录'
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<ParkingAccessRecordsVO[]>([])
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
          ...formState,
        }
        const res = await cubeParkingLotService.getParkingAccessRecords(params)
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

    const handleConfirmFilter = (): void => {
      onRefresh()
    }

    onMounted(() => {
      onRefresh()
    })

    const renderStatus = (type: AccessType) => {
      if (!type) {
        return null
      }
      const isEntry = type === AccessType.ACCESS_IN
      return (
        <div class={[styles['status-circle'], isEntry ? styles['in'] : styles['out']]}>
          {isEntry ? '入场' : '出场'}
        </div>
      )
    }
    const getStatusColor = (type: AccessType) => {
      if (!type) {
        return ''
      }
      return type === AccessType.ACCESS_IN ? '#FE8704' : '#00C853'
    }
    const previewImg = (imgs: string[], index: number): void => {
      showImagePreview(
        imgs.map((f) => f ?? ""),
        index,
      );
    };

    return (): JSX.Element => (
      <div class={styles['access-record-list']}>
        <CubeNavBar showBack title={'出入记录'} />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <div class={styles['violation-cell-group']}>
              {dataSource.value.map((item, index) => (
                <div key={item.id ?? index} class={styles['violation-card']}>
                  <Cell>
                    <div class={styles['violation-cell-title']}>
                      <div class={styles['name-status']}>
                        <span 
                          class={styles['status-tag']} 
                          style={{ background: getStatusColor(item.accessType) }}
                        >
                          {renderStatus(item.accessType)}
                        </span>
                        <span class={styles.name}>{item?.vehicleNo || '--'}</span>
                      </div>
                    </div>
                  </Cell>
                  <div class={styles['violation-cell-content']}>
                    <div class={styles['info-item']}>
                      <label>所属停车场：</label>
                      <span>{item?.parkingInfoName || '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>通行时间：</label>
                      <span>{item?.accessTime ? dayjs(item.accessTime).format('YYYY-MM-DD HH:mm') : '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>位置：</label>
                      <span>{item?.channelName || '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>图片：</label>
                      <span>{item?.channelName || '--'}</span>

                      <div class={styles["img-list"]}>
                        <div
                          class={styles["img-warp"]}
                          onClick={() => {
                            previewImg([item?.imageUrl], index);
                          }}
                        >
                          <Image src={item?.imageUrl} class={styles["img-item"]} />
                        </div>
                      </div>
                    </div>
                  </div>
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
