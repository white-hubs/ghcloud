
import { computed, defineComponent, onMounted, ref, type Ref } from 'vue'
import { StationHeader } from './components/header/header'
import { setPageWidth } from '@/hook/use-fit'
import './nurse-station.less'
import { Page } from '@ghcloud/cube-ui'
import { storeCache } from '@/store/cache'
import { LittleCard } from './components/little-card/little-card'
import { AreaCascaderSelect } from '@/components/area-cascader-select/area-cascader-select'
import { RequestHelp } from '@/components/request-help/request-help'
import type { DevicePropsForUI } from '@/hook/use-props'
import { useDept } from '@/hook/use-dept'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { DeptSelect } from '@/components/dept-select/dept-select'

/** 护士站 */
export const NurseStation = defineComponent({
  setup: () => {
    localStorage.removeItem('auto-entrance-screen')
    const cacheStore = storeCache()
    const area = ref('')
    const { deptSelect, setDeptCache } = useDept()
    const deptId = ref(deptSelect.value?.id)

    const pageSize = 40
    const pageNumber = ref(1)
    const dataSource = computed(() => {
      return cacheStore.roomListByDept.filter((item) => {
        if (!area.value) return true
        return item.areaId.includes(Array.isArray(area.value) ? area.value.join('-') : area.value)
      }).slice((pageNumber.value - 1) * pageSize, pageNumber.value * pageSize)
    })
    const requestSelectRoom = ref<string>('')
    const requestSelectRoomProps = computed(() => {
      if (requestSelectRoom.value === '' && dataSource.value.length === 1) {
        requestSelectRoom.value = dataSource.value[0].deviceId
      }
      return (currentPageProps.value[requestSelectRoom.value] ?? []).filter(e => e.code !== 'airconditioner')
    })
    const currentPageProps: Ref<Record<string, DevicePropsForUI[]>> = ref({})
    const onPropsChange = (deviceId: string, deviceProps: DevicePropsForUI[]): void => {
      currentPageProps.value[deviceId] = deviceProps
    }

    onMounted(() => {
      setPageWidth(1920)
    })

    return (): JSX.Element =>
      <div class='nurse-station'>
        <StationHeader onChange={(value) => {
          area.value = value
        }} />
        <div class='inline-form'>
          <span class='label'>选择区域</span>
          <AreaCascaderSelect v-model:value={area.value} />
          <div style={{ margin: '0 0 0 10px' }}>
            <span class='label'>选择科室</span>
            <DeptSelect
              v-model:value={deptId.value}
              placeholder='请选择所在科室'
              onChange={(item: DeptList) => {
                setDeptCache(item)
              }}
            />
          </div>
        </div>
        <div class='card-list'>
          {
            dataSource.value.map(e => <LittleCard key={e.deviceId} deviceInfo={e} onPropsChange={(props) => {
              onPropsChange(e.deviceId, props)
            }} />)
          }
        </div>
        <div class='page'>
          <Page showQuickJumper showSizeChanger={false} pageSize={40} showTotal={() => ''} total={cacheStore.roomList.length} onPageChange={(page) => {
            pageNumber.value = page
          }} />
        </div>
        <RequestHelp
          deviceProps={requestSelectRoomProps.value}
          deviceList={dataSource.value}
          onRoomSelect={(e) => {
            requestSelectRoom.value = e
          }}
        />
      </div>
  }
})
