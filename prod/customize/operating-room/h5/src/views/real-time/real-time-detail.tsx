import { Legend } from '@/components/legend/legend'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import './real-time-detail.less'
import { useRoute } from 'vue-router'
import type { NormDataVO, RealTimeMonitorVO } from '@ghcloud/cube-operating-room-service'
import { intToRoman } from '@/hook/use-utils'
import { DetailItem } from './components/detail-item/detail-item'
import { PullRefresh, showNotify } from 'vant'
import { cubeOperatingRoomService } from '@/api/server'

export const RealTimeDetail = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }
    const refreshing = ref(false)
    const loading = ref(true)

    const deviceInfo = ref<RealTimeMonitorVO>()
    const normCard = ref<NormDataVO[]>([])
    const level = ref(0)
    const oneCard = computed(() => {
      return normCard.value?.filter(e => e.showArea === '1' && Number(e.display) === 1).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
        return {
          unit: item.unit ?? '',
          status: item.status ?? '',
          normCode: item.normCode ?? '',
          normName: item.normName ?? '',
          value: item.value as unknown as undefined,
          display: item.display as unknown as number,
        }
      })
    })
    const twoCard = computed(() => {
      return normCard.value?.filter(e => e.showArea === '2' && Number(e.display) === 1).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
        return {
          unit: item.unit ?? '',
          status: item.status ?? '',
          normCode: item.normCode ?? '',
          normName: item.normName ?? '',
          value: item.value as unknown as undefined,
          display: item.display as unknown as number,
        }
      })
    })
    const threeCard = computed(() => {
      return normCard.value?.filter(e => e.showArea === '3' && Number(e.display) === 1).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
        return {
          unit: item.unit ?? '',
          status: item.status ?? '',
          normCode: item.normCode ?? '',
          normName: item.normName ?? '',
          value: item.value as unknown as undefined,
          display: item.display as unknown as number,
        }
      })
    })
    const umList = computed(() => {
      return normCard.value.filter(e => e.showArea === '4' && Number(e.display) === 1).map(e => {
        return {
          ...e,
          unit: '个/m³',
        }
      }).sort((a, b) => a.sort ?? 0 - (b.sort ?? 0))
    })
    /** 关机手术室，空调状态 1 开机， 0 正常停机 */
    const roomStatus = computed(() => {
      const airValue = normCard.value?.find(e => e.normCode === 'airconditioner')?.value
      const name = airValue === 1 ? '开机' : airValue === 0 ? '正常停机' : ''
      return {
        name,
        value: airValue,
        isOpen: airValue === 1,
      }
    })
    const areaOptions = computed(() => {
      return deviceInfo.value?.areaOptions
    })
    const getAreaName = (key: string): string => {
      let areas: { label: string; value: string; }[] = []
      try {
        areas = areaOptions.value ? JSON.parse(areaOptions.value) : []
      } catch {
        areas = []
      }
      return areas.find((e: { value: string; }) => e.value === key)?.label ?? ''
    }
    const getData = async (): Promise<void> => {
      try {
        loading.value = true

        const res = await cubeOperatingRoomService.getRealDetailByRule({ id })
        deviceInfo.value = res.records[0]
        normCard.value = res.records[0].details
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    let timer: string | number | NodeJS.Timeout | null | undefined = null
    onMounted(() => {
      document.title = '监测详情'
      getData()
      timer = setInterval(() => {
        getData()
      }, 15000)
    })
    const onRefresh = async (): Promise<void> => {
      await getData()
      refreshing.value = false
    }
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    return (): JSX.Element =>
      <div class='real-detail-page'>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class='list-pull-refresh'>
          <div class='detail-top'>
            <div class='left'>
              <span class='name'>{deviceInfo.value?.operatingRoomName ?? ''}</span>
              <span class='level'>洁净等级 {intToRoman(level.value ?? 0)}</span>
            </div>
            <div class='um-info'>
              {
                umList.value.map((e) => {
                  return (
                    <div class='um-item' key={e.normCode}>
                      <span>{e.normName}</span>
                      <span>{e.value ?? '--'}<span class='unit'>{e.unit}</span></span>
                    </div>
                  )
                })
              }
            </div>
            <div class='bg' />
          </div>
          <Legend />
          <div class='item-box'>
            <div class='item-box-title'>{getAreaName('1') || '标准参数'}</div>
            <DetailItem record={oneCard.value} roomStatus={roomStatus.value} />
          </div>
          <div class='item-box'>
            <div class='item-box-title'>{getAreaName('2') || '健安参数'}</div>
            <DetailItem record={twoCard.value} roomStatus={roomStatus.value} />
          </div>
          <div class='item-box'>
            <div class='item-box-title'>{getAreaName('3') || '运管参数'}</div>
            <DetailItem record={threeCard.value} roomStatus={roomStatus.value} />
          </div>
        </PullRefresh>
      </div>
  }
})
