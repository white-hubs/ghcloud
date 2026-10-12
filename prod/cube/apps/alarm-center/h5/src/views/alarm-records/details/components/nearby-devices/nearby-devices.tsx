import { defineComponent, onMounted, reactive, ref, type PropType } from 'vue'
import { List, Empty, Cell, CellGroup, Tag, showNotify } from 'vant'
import { cubeAlarmCenterService } from '../../../../../api/server'
import type { AlarmDetails, AlarmNearbyDevice, Pagination } from '@ghcloud/cube-alarm-center-service'
import styles from './nearby-devices.module.less'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

export const NearbyDevices = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {}
    }
  },
  setup: (props) => {
    const dataSource = ref<AlarmNearbyDevice[]>([])
    const loading = ref(false)
    const finished = ref(false);
    const formState = reactive({
      pageNumber: 1,
      total: 1,
      pageSize: 20
    })

    const getDataSource = async (): Promise<void> => {
      try {
        loading.value = true
        finished.value = false
        const firstPage = await cubeAlarmCenterService.getAlarmRecordDeviceList({
          alarmRecordId: props.details.id,
          pageNumber: formState.pageNumber,
          pageSize: formState.pageSize,
        })
        const queryTask: Promise<Pagination<unknown>>[] = []
        if (firstPage.pages > 1){
          for (let i = 2; i <= firstPage.pages; i++){
            queryTask.push(cubeAlarmCenterService.getAlarmRecordDeviceList({
              alarmRecordId: props.details.id,
              pageNumber: i,
              pageSize: formState.pageSize,
            }))
          }
        }
        await Promise.all(queryTask).then(res=>{
          dataSource.value.length = 0
          // @ts-ignore
          dataSource.value = [...firstPage.records, ...res.map(e=>e.records)]
        })
      } catch {
        showNotify({ type: 'danger', message: '请求失败' })
      } finally {
        finished.value = true
        loading.value = false
      }
    }

    onMounted(() => {
      getDataSource()
    })

    const toNativeDeviceDetails = (device: AlarmNearbyDevice): void => {
      cubeAppService.openBusinessDetailsPage({
        applicationCode: 'EQUIPMENT_SUPERVISION',
        businessKey: device.id,
        businessType: '',
      })
    }

    return (): JSX.Element =>
      <>
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
        >
          {
            (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item: AlarmNearbyDevice) => {
                      return (
                        <CellGroup inset class={styles['cell-group']} key={item.id}>
                          <Cell class={styles.cell} onClick={() => {
                            toNativeDeviceDetails(item)
                          }}>
                            <div class={styles['cell-item']}>
                              <div>
                                <div class={styles['cell-title']}>
                                  <Tag text-color='#ffffff' color={item.status.onlineState ? '#58bd6b' : '#858585'}>{item.status.onlineState ? '在线' : '离线'}</Tag>
                                  <span>{item?.name || '--'}</span>
                                </div>
                                <div class={styles['cell-content']}>
                                  <label>设备编号：</label>
                                  <span>{item.code || '--'}</span>
                                </div>
                                <div class={styles['cell-content']}>
                                  <label>所属产品：</label>
                                  <span>{item.productInfo?.name || '--'}</span>
                                </div>
                                <div class={styles['cell-content']}>
                                  <label>产品品类：</label>
                                  <span>{item.productInfo?.productCategory.name || '--'}</span>
                                </div>
                              </div>
                            </div>
                          </Cell>
                        </CellGroup>
                      )
                    })
          }
          {(dataSource.value.length === 0 && formState.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
        </List>
      </>
  }
})