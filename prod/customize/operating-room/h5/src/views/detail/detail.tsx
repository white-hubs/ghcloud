import { Legend } from '@/components/legend/legend'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import './detail.less'
import { useRoute } from 'vue-router'
import { CubeOperatingRoomSubscribeService, DevicePropStatus, type NormDataVO } from '@ghcloud/cube-operating-room-service'
import type { NorthDeviceDetail } from '@ghcloud/cube-iot-center-service'
import { authStore } from '@/api/auth-store'
import { intToRoman } from '@/hook/use-utils'

export const Detail = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }

    const loading = ref(true)
    const deviceInfo = ref<NorthDeviceDetail>()
    const smallCard = ref<NormDataVO[]>()
    const middleCard = ref<NormDataVO[]>()
    const umList = ref<NormDataVO[]>([])
    const level = ref(0)

    const cubeOperatingRoomSubscribeService = new CubeOperatingRoomSubscribeService(authStore)
    cubeOperatingRoomSubscribeService.emitter.on('device-real-time-data', (res) => {
      level.value = res.find(e => e.normCode === 'cleanlinessLevel')?.value ?? 0
      umList.value = res.filter(e => e.showArea === '4').map(e => {
        return {
          ...e,
          unit: '个/m³',
        }
      }).sort((a, b) => a.sort ?? 0 - (b.sort ?? 0))

      smallCard.value = res.filter(e => e.showArea === '1').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
        return {
          unit: item.unit ?? '',
          status: item.status ?? '',
          normCode: item.normCode ?? '',
          normName: item.normName ?? '',
          value: item.value as unknown as undefined,
          display: item.display as unknown as number,
        }
      })
      const showArea2 = res.filter(e => e.showArea === '2').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      const showArea3 = res.filter(e => e.showArea === '3').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      middleCard.value = [...showArea2, ...showArea3].map(item => {
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

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        cubeOperatingRoomSubscribeService.dispose()
        const res = await cubeOperatingRoomSubscribeService.subscribe(id)
        deviceInfo.value = res.deviceInfo
      } catch {

      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      document.title = '医疗洁净业务监测详情'
      getData()
    })

    onBeforeUnmount(() => {
      cubeOperatingRoomSubscribeService.dispose()
    })
    return (): JSX.Element =>
      <div class='detail-page'>
        <Legend style='padding:0;margin-bottom:5vw' />
        <div class='row'>
          <div class='border small-item name'>
            <span>{deviceInfo.value?.deviceName ?? ''}</span>
            <span class={['level', 'bg-normal']}>洁净等级 {intToRoman(level.value ?? 0)}
            </span>
          </div>
          <div class='border small-item um-info'>
            {
              umList.value.map(e => {
                return (
                  <div class='um-item' key={e.normCode}>
                    <span>{e.normName}</span><span>{e.value ?? '--'}{e.unit}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div class='border device-attribute'>
          {
            smallCard.value?.map(e => {
              return (
                <div
                  class={['device-attribute-item',
                    Number(e.display) === 1 ? 'show' : 'hide',
                    e.status === DevicePropStatus.NORMAL ? 'normal' : e.status === DevicePropStatus.LOWER_LIMIT ? 'low' : e.status === DevicePropStatus.UPPER_LIMIT ? 'high' : 'normal']}
                  key={e.normName}
                >
                  <div class='title'>
                    <span>{e.normName}</span>
                  </div>
                  <div class='numerical'>
                    <span class='value'>{e.value ?? '--'}</span>
                    <span class='unit'>{e.unit}</span>
                  </div>
                </div>
              )
            })
          }
        </div>

        <div class='border device-attribute-second'>
          {
            middleCard.value?.map(e => {
              return (
                <div
                  class={['device-attribute-second-item',
                    Number(e.display) === 1 ? 'show' : 'hide',
                    e.status === DevicePropStatus.NORMAL ? 'normal' : e.status === DevicePropStatus.LOWER_LIMIT ? 'low' : e.status === DevicePropStatus.UPPER_LIMIT ? 'high' : 'normal']} key={e.normName}
                >
                  {e.normName}：{e.value ?? '--'}{e.unit}
                </div>
              )
            })
          }
        </div>
      </div>
  }
})
