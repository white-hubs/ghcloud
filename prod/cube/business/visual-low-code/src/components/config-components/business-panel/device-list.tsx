import { Teleport, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CameraViewType, CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import { Input, Select, Location, DocumentTextOutline, NotificationsSharp, Pagination } from '@ghcloud/visual-view-ui'
import { getDevicePage } from '@/apis/business/device.ts'
import styles from './style/device-list.module.less'
import { useRouter } from 'vue-router'
import DevicePanel from './components/device-panel'
import Equ from './components/equipmentdetails/index'
import UeClient from '@/static/model/ue-client'
import { DeviceTypeIcon } from '@/utils/enumeratie'
interface InSearch {
  status: string | undefined;
  keyword: string;
  pageSize: number;
  pageCount: number;
  pageNumber: number;
  total: number;
}
export default defineComponent({
  name: 'device-list',
  props: ['style', 'item'],
  setup: (props) => {
    const deviceQuery = reactive<InSearch>({
      status: undefined,
      keyword: '',
      pageSize: 20,
      pageNumber: 1,
      pageCount: 1,
      total: 0,
    })
    const ueClient = UeClient.getInstance()
    const router = useRouter()
    const itemShow = ref(false)
    const currentRoute = router.currentRoute
    const chartEditStore = useChartEditStore()
    const deviceListComponent = ref<CreateComponentType | null>()
    const searchOption = [
      { label: '正常', value: 'NORMAL' },
      { label: '报警', value: 'ALARM' },
      { label: '故障', value: 'TROUBLE' },
      { label: '离线', value: 'OFFLINE' }
    ]
    const column = [
      {
        title: '设备名称',
        dataIndex: 'name',
        width: 100,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
      },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 90,
      },
    ]
    const tableData = ref([])
    // 按状态搜索
    const handelStatus = (val: string): void => {
      deviceQuery.pageNumber = 1
      deviceQuery.status = val
      requestDevicePage()
    }
    // 按名称搜索
    const handleKeyWord = (val: string): void => {
      deviceQuery.pageNumber = 1
      deviceQuery.keyword = val
      requestDevicePage()
    }
    // 获取设备数据
    const requestDevicePage = async (): Promise<void> => {
      if (deviceListComponent.value?.config.deviceRange) {
        const res = await getDevicePage({ ...deviceQuery, genreId: deviceListComponent.value.config.deviceRange })
        // const list: unknown[] = []
        // deviceListComponent.value?.config.deviceRange.forEach((element: string) => {
        //   const res = getDevicePage({ pageNumber: 1, pageSize: 10, genreId: element })
        //   list.push(res)
        // })
        // Promise.all(list).then(res => {
        //   let list = []
        //   res.forEach(item => {
        //     list = list.concat(item.data.records)
        //   })
        tableData.value = res.data.records ?? []
        deviceQuery.pageCount = res.data.pages

        // })
      }
    }
    // 点击定位
    const lastView = ref<CameraViewType>()
    const positioning = (e: MouseEvent, data: { code: string; }): void => {
      e.stopPropagation()
      currentDevice.value = data
      // 获取聚焦前的视角
      ueClient.send('getCameraView', function (cameraView: CameraViewType) {
        lastView.value = cameraView
      })
      // 聚焦设备
      ueClient.send('focusActor', { id: data.code })
      itemShow.value = false
      showSmallPanel.value = true
    }
    // 点击详情
    const clickTableRow = (e: MouseEvent, tr: unknown): void => {
      e.stopPropagation()
      currentDevice.value = tr
      itemShow.value = true
      showSmallPanel.value = false
    }
    // 点击行
    const currentIndex = ref(0)
    const showSmallPanel = ref(false)
    const currentDevice = ref()
    const lastCode = ref('')
    const handleRow = (tr: { code: string; genreName: string; }, index: number): void => {
      currentIndex.value = index
      currentDevice.value = tr
      showSmallPanel.value = true
      itemShow.value = false
      // 移除上一个标签
      ueClient.send('removeActorPoi', { targetActorId: lastCode.value })
      // 添加标签
      ueClient.send('addIconPoi', {
        icon: DeviceTypeIcon[tr.genreName as keyof typeof DeviceTypeIcon],
        color: 0,
        targetActorId: tr.code,
        location: { x: 0, y: 0, z: 0 },
        cameraMin: 0,
        cameraMax: 15000,
        scale: 1,
        props: {}
      })
      lastCode.value = tr.code
    }
    onMounted(() => {
      requestDevicePage()
    })
    // 翻页
    const handlePage = (val: number): void => {
      deviceQuery.pageNumber = val
      requestDevicePage()
    }
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceListComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-list')
    }, { deep: true, immediate: true })
    watch(() => chartEditStore.getCurrentBlock?.config.deviceRange, () => {
      if (currentRoute.value.name === 'editor-config' && chartEditStore.getCurrentBlock?.config.deviceRange) {
        requestDevicePage()
      }
    }, { deep: true, immediate: true })
    watch(() => showSmallPanel.value, () => {
      if (!showSmallPanel.value && !itemShow.value && ueClient.send) {
        ueClient.send('setCameraView', lastView.value)
      }
    })
    watch(() => itemShow.value, () => {
      if (!showSmallPanel.value && !itemShow.value && ueClient.send) {
        ueClient.send('setCameraView', lastView.value)
      }
    })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }} class={styles.wrapper}>
        <SubPanelTemplate title={deviceListComponent.value?.title}>
          <div class={`${styles['flex-between']}`}>
            <Select
              clearable
              placeholder='设备类型' v-model:value={deviceQuery.status} style={{ width: '120px' }}
              onChange={handelStatus} options={searchOption}
            />
            <Input
              enter-button v-model:value={deviceQuery.keyword} placeholder='按设备名称搜索'
              style={{ width: '180px', marginLeft: '4px' }} onChange={handleKeyWord}
            />
          </div>
          <div class={styles.device_list}>
            <div class={`${styles.header} ${styles['flex-between']}`}>
              {column.map((td, index) =>
                <div class={styles['table-th']} key={index} style={td.dataIndex !== 'operate' ? { width: '36%', textAlign: 'left' } : { width: '28%', textAlign: 'left' }}>
                  {td.title}
                </div>
              )}
            </div>
            <div class={styles.device_item}>
              {
                tableData.value.map((tr, index) =>
                  <div class={`${styles['table-tr']} ${styles['flex-between']}`} key={index} onClick={() => { handleRow(tr, index) }} style={currentIndex.value === index ? { background: 'rgba(61, 143, 230, 0.4)' } : { background: 'none' }}>
                    {
                    column.map((td, j) => {
                      if (td.dataIndex === 'status') {
                        return (
                          <div class={styles['table-td']} key={`${index} + '_' + ${j}`} style={{ width: '36%', textAlign: 'left' }}>
                            <div v-show={tr[td.dataIndex] === 'NORMAL'} style='color: #58FAB6;' class={styles.opreate}>
                              <NotificationsSharp />
                              <span>正常</span>
                            </div>
                            <div v-show={tr[td.dataIndex] === 'OFFLINE'} style='color: #D9E7FF;' class={styles.opreate}>
                              <NotificationsSharp />
                              <span>离线</span>
                            </div>
                            <div v-show={tr[td.dataIndex] === 'TROUBLE'} style='color: #FFAB10' class={styles.opreate}>
                              <NotificationsSharp />
                              <span>故障</span>
                            </div>
                            <div v-show={tr[td.dataIndex] === 'ALARM'} style='color: #F14545' class={styles.opreate}>
                              <NotificationsSharp />
                              <span>报警</span>
                            </div>
                          </div>
                        )
                      } else if (td.dataIndex === 'operate') {
                        return (
                          <div style={{ color: '#2989FF', width: '28%', textAlign: 'left' }} class={styles['flex-between']} key={`${index} + '_' + ${j}`}>
                            <div onClick={(e) => { positioning(e, tr) }} class={styles.opreate}>
                              <Location />
                              <span>定位</span>
                            </div>
                            <div onClick={(e) => { clickTableRow(e, tr) }} class={styles.opreate}>
                              <DocumentTextOutline />
                              <span>详情</span>
                            </div>
                          </div>
                        )
                      } else {
                        return <div key={`${index} + '_' + ${j}`} style={{ width: '36%', textAlign: 'left' }}>{tr[td.dataIndex]}</div>
                      }
                    }
                    )
                  }
                  </div>
                )
              }
            </div>
          </div>
          <div class={styles.pagination}>
            <Pagination v-model:page={deviceQuery.pageNumber} pageCount={deviceQuery.pageCount} onPageChange={handlePage} />
          </div>
        </SubPanelTemplate>
        <Teleport to='body'>
          <div v-show={showSmallPanel.value}>
            <DevicePanel v-model:isShow={showSmallPanel.value} device={currentDevice.value} onItemShow={(show) => { itemShow.value = show }} />
          </div>
        </Teleport>
        <Teleport to='body'>
          <div v-show={itemShow.value}>
            <Equ
              id={currentDevice.value?.id} v-model:itemShow={itemShow.value}
            />
          </div>
        </Teleport>

      </div>
    )
  }
})
