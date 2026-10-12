import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, Cell, Image as VanImage, showImagePreview, Button, Tab, Tabs, showNotify } from 'vant'
import styles from './car-identify-detail.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeParkingLotService } from '@/api/server'
import type { VehicleInfoDetailVO, VehiclePenaltyRecordVO } from '@ghcloud/cube-parking-lot-service/src/type'
import { useGlobalRouter } from '@/hook/use-global-router'
import dayjs from "dayjs";

export const CarIdentifyDetail = defineComponent({
  name: 'CarIdentifyDetail',
  setup () {
    const { route, router } = useGlobalRouter()
    const id = route.query?.id as string ?? ''
    const plateNumber = route.query?.plateNumber as string
    
    const vehicleInfo = ref<VehicleInfoDetailVO>({} as VehicleInfoDetailVO)
    const activeTab = ref(0)
    
    const dataSource = ref<VehiclePenaltyRecordVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 0,
      pageSize: 10
    })

    const getVehicleInfo = async () => {
      try {
        const res = plateNumber ? await cubeParkingLotService.getPlateNumberDetail({ vehicleNo: plateNumber }) : await cubeParkingLotService.getVehicleDetail(id)
        vehicleInfo.value = res
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'warning', message: errorMessage || '请求失败' })
      }
    }

    const onLoad = async (): Promise<void> => {
      if (!vehicleInfo.value.vehicleNo) {
        if (!id) {
            loading.value = false
            finished.value = true
            return
        }
        loading.value = false
        return
      }

      try {
        loading.value = true
        search.pageNumber++
        
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          plateNumber: vehicleInfo.value.vehicleNo || '',
          violationTime: '',
        }

        const res = await cubeParkingLotService.getParkingBlackDetail(params)
        
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'warning', message: errorMessage || '请求失败' })
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

    const init = async () => {
        await getVehicleInfo()
        onRefresh()
    }

    onMounted(() => {
      init()
    })

    const handlePreviewImage = (index: number) => {
        const images = vehicleInfo.value.fileVOList?.map(item => 
            item.path?.startsWith('http') ? item.path : `${window.location.origin}${item.path}`
        ) || []

        showImagePreview({
            images,
            startPosition: index,
            closeable: true,
        })
    }

    const toDetail = (item: any): void => {
       const path = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=ILLEGAL_PARKING&processId=${item?.processInstanceId}`
       window.location.href = path
    }
    const handleAdd = (): void => {
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=ILLEGAL_PARKING&vehicleNo=${vehicleInfo.value.vehicleNo}`
    }

    return (): JSX.Element => (
      <div class={styles.details}>
        <CubeNavBar 
          showBack 
          title={'车辆识别'} 
          rightSlot={() => <span style={{ color: '#1989fa'}}onClick={() => handleAdd()}>发起违停工单</span>}
        />
        
        <div class={styles['top-card']}>
            <div class={styles['card-header']}>
                <div class={styles['card-title']}>{vehicleInfo.value.vehicleNo || '--'}</div>
            </div>
            <div class={styles['card-content']}>
                <div class={styles['content-item']}>
                    <span class={styles['item-label']}>车主：</span>
                    <span class={styles['item-value']}>{vehicleInfo.value.customerName || '--'}</span>
                </div>
                <div class={styles['content-item']}>
                    <span class={styles['item-label']}>联系方式：</span>
                    <span class={styles['item-value']}>{vehicleInfo.value.customerMobile || '--'}</span>
                </div>
                <div class={styles['content-item']}>
                    <span class={styles['item-label']}>车辆类型：</span>
                    <span class={styles['item-value']}>{vehicleInfo.value.vehicleTypeName || '--'}</span>
                </div>
            </div>
        </div>

        <Tabs v-model:active={activeTab.value} sticky offset-top={46}>
            <Tab title="违停记录">
                <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['list-container']}>
                  <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text="没有更多了"
                    onLoad={onLoad}
                  >
                    {dataSource.value.length > 0 ? (
                      dataSource.value.map((item, index) => (
                        <div class={styles['detail-card']} key={index}>
                          <div onClick={() => toDetail(item)}>
                            <Cell
                              // is-link
                              center
                              v-slots={{
                                title: () => (
                                  <div class={styles['cell-title']}>
                                    <span class={styles.text}>{item.plateNumber || '--'}</span>
                                  </div>
                                )
                              }}
                            />
                            <div class={styles['cell-content']}>
                              <div class={styles['info-item']}>
                                <span>车主：{item?.ownerName || '--'}</span>
                              </div>
                              <div class={styles['info-item']}>
                                <span>联系方式：{item?.ownerPhone || '--'}</span>
                              </div>
                              <div class={styles['info-item']}>
                                <span>违停时间：{item.illegalTime ? dayjs(item.illegalTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                              </div>
                              <div class={styles['info-item']}>
                                <span>违停工单：
                                  <span class={styles.link} onClick={() => toDetail(item)}>
                                    {item?.worKOrderName || '工单详情'}
                                  </span>
                                </span>
                              </div>
                              <div class={styles['info-item']}>
                                <span>违停扣分：{item?.violationScore || 0}分</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      !loading.value && <Empty description="暂无数据" />
                    )}
                  </List>
                </PullRefresh>
            </Tab>
            <Tab title="车辆附件">
                {vehicleInfo.value?.fileVOList && vehicleInfo.value?.fileVOList?.length > 0 ? (
                     vehicleInfo.value.fileVOList.map((item, index) => (
                        <div class={styles['attachment-container']} key={index}>
                            <VanImage 
                                src={item.path?.startsWith('http') ? item.path : `${window.location.origin}${item.path}`} 
                                class={styles['image-preview']} 
                                fit="contain"
                                onClick={() => handlePreviewImage(index)}
                            />
                        </div>
                    ))
                ) : <Empty description="暂无附件" />}
            </Tab>
        </Tabs>
      </div>
    )
  }
})
