import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from './device-list.module.less'
import { PullRefresh, List, Empty, Icon, showNotify } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import type { DeviceVO } from '@ghcloud/cube-zhongda-heshun-service'
import { DeviceItem } from '@/components/device-item/device-item'
import { getAssetsFile } from '../../../utils/index'
import { useRoute, useRouter } from 'vue-router'
import { cubeZhongdaHeshunService } from '@/api/server'
import { SkeletonBody } from '@/components/skeleton-body/skeleton-body'
import { storeKill } from '@/store/kill'
import { useScanCode } from '@/hooks/use-scan-code'
import { ensureCoordsForBind, getCoordsForBind, useMpLocation } from '@/hooks/use-mp-location'

export const DeviceList = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(true)
    useMetaTitle()
    const router = useRouter()
    const store = storeKill()

    const isAdmin = ref(store.isAdmin)
    const groupActive = ref(store.groupActive)

    const dataSource = ref<DeviceVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const skeletonLoading = ref(true)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    })

    const getDataSource = async (): Promise<{ total: number; records: DeviceVO[]; }> => {
      try {
        return cubeZhongdaHeshunService.getDevicePageList({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          groupId: groupActive.value,
        });
      } catch {
        return { total: 0, records: [] };
      }
    };

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()

        // 设置完成状态
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true
        }

        // 第一页时清空数据
        if (search.pageNumber === 1) {
          dataSource.value = []
        }

        // 添加新数据前进行去重处理，避免重复数据
        const newRecords = res.records.filter(newItem =>
          !dataSource.value.some(existingItem => existingItem.id === newItem.id)
        );

        dataSource.value = [...dataSource.value, ...newRecords]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
        skeletonLoading.value = false
      }
    }

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }

    const handleDeviceInfo = ({ index, record }: { index: number; record: DeviceVO; }): void => {
      dataSource.value[index] = record
      router.push({ path: '/device-detail', query: { id: record.id } })
    }

    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      skeletonLoading.value = true
      onRefresh()
    }
    const addDeviceBusy = ref(false)
    const handleAddDevice = async (): Promise<void> => {
      if (addDeviceBusy.value) {
        return
      }
      addDeviceBusy.value = true
      try {
        const cached = await getCoordsForBind()
        const hasCoords =
          typeof cached.latitude === 'number' &&
          typeof cached.longitude === 'number' &&
          !Number.isNaN(cached.latitude) &&
          !Number.isNaN(cached.longitude)
        if (!hasCoords) {
          showNotify({ type: 'primary', message: '当前未获取到位置信息，正在重新获取' })
          await ensureCoordsForBind()
        }
        router.push({ path: `/device-product` })
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取定位失败，请重试'
        showNotify({ type: 'danger', message })
      } finally {
        addDeviceBusy.value = false
      }
    }

    const { isWxEnv, getUrlParams } = useScanCode()
    /** 解析小程序回写之 mpLocationResult；主动调用定位请使用 `import { useMpLocation } from '@/hooks/use-mp-location'` */
    useMpLocation()
    const getInitData = async (): Promise<void> => {
      await getData()
      if (isWxEnv.value) {
        await getUrlParams()
        await getData()
      } 
    }
    
    const route = useRoute()
    
    watch(() => route.query, (newQuery, oldQuery) => {
      if (newQuery?.refresh === 'true' || newQuery?.timestamp !== oldQuery?.timestamp) {
        onRefresh()
      }
    }, { immediate: false })

    onMounted(async () => {
      await store.updateGroupInfo()
      groupActive.value = store.groupActive
      isAdmin.value = store.isAdmin
      await getInitData()
      
      // 检查初始路由参数
      const refresh = route.query?.refresh as string
      if (refresh === 'true') {
        setTimeout(() => {
          onRefresh()
        }, 500) 
      }
    })

    return (): JSX.Element =>
      <div class={styles.container}>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['device-list-pull-refresh']}>
          {skeletonLoading.value ? (
            <SkeletonBody/>
          ) : (
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {dataSource.value.length === 0 && !isAdmin.value ? (
                <div class={styles.empty}>
                  <Empty description="暂无设备" image={getAssetsFile('device-nodata.png')} />
                </div>
              ) : (
                <div class={styles['list-wrap']}>
                  {isAdmin.value && (
                    <div class={styles.addButton} onClick={handleAddDevice}>
                      <Icon name="add-o" class={styles.addButtonIcon} />
                    </div>
                  )}
                  {dataSource.value.map((record, index) => (
                    <DeviceItem
                      key={record.id}
                      record={record}
                      recordIndex={index}
                      onHandleInfo={handleDeviceInfo}
                    />
                  ))}
                </div>
              )}
            </List>
          )}
        </PullRefresh>
        {/* <BottomTabBar active="device" /> */}
      </div>
  }
})
