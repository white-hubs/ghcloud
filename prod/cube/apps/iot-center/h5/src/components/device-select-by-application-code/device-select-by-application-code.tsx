import { List, Empty, PullRefresh, Cell, CellGroup, Search, Image, Tag, Popup, RadioGroup, Radio } from 'vant'
import { defineComponent, reactive, ref, watch } from 'vue'
import styles from './device-select-by-application-code.module.less'
import { cubeSecurityService } from '../../api/server'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'

interface Props {
  applicationCode: string;
  visible: boolean;
  selectDevice: SecurityDeviceRecord | undefined;
}

/** 设备选择组件 通过应用code 筛选 */
export const DeviceSelectQueryByApplicationCode = defineComponent({
  props: ['applicationCode', 'visible', 'selectDevice'],
  emits: ['selected'],
  setup: (props: Props, { emit }) => {
    const dataSource = ref<SecurityDeviceRecord[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive<{
      tagCodes?: string[];
      deviceProdCategoryCodeConcat?: string;
      deviceStatus?: boolean | string;
      applicationCode: string;
      pageSize: number;
      pageNumber: number;
      appAreaId?: string;
      areaName?: string;
      keyword?: string;
      total: number;
    }>({
      applicationCode: props.applicationCode,
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const selected = ref()
    watch(() => props.selectDevice, () => {
      selected.value = props.selectDevice ? props.selectDevice.deviceId : undefined 
    }, { immediate: true })
    // 获取设备列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeSecurityService.getDeviceMonitoringPage({ ...search })
        search.total = res.total
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value || search.pageNumber === 1) {
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
      dataSource.value.length = 0
      onLoad()
    }

    return (): JSX.Element =>
      <Popup show={props.visible} position='right' style={{ width: '100vw', height: '100vh' }}>
        <Search v-model={search.keyword} placeholder='根据设备名称进行搜索' onSearch={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ overflow: 'auto', height: 'calc(100vh - 54px)' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <RadioGroup modelValue={selected.value}>
              {
                dataSource.value && dataSource.value.length > 0 && dataSource.value.map((item) => {
                  return (
                    <CellGroup inset class={styles['cell-group']} key={item.deviceId}>
                      <Cell class={styles.cell} onClick={() => {
                        emit('selected', item) 
                      }}>
                        <div class={styles['cell-item']}>
                          <Image width='50' height='50' src={item.picture} />
                          <div>
                            <div class={styles['cell-title']}>
                              <Tag text-color='#ffffff' color={item.deviceStatus ? '#58bd6b' : '#858585'}>{item.communicationStatus}</Tag>
                              <span>{item?.deviceName || '--'}</span>
                            </div>
                            <div class={styles['cell-content']}>
                              <label>所在区域：</label>
                              <span>{item.areaName || '--'}</span>
                            </div>
                          </div>
                          <Radio name={item.deviceId} />
                        </div>
                      </Cell>
                    </CellGroup>
                  )
                })
              }
            </RadioGroup>
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </Popup>
  }
})
