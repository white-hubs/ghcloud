import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { TallyCounter } from '@/components/business/tally-counter/tally-counter'
import { useRoute } from 'vue-router'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMeattradeService } from '@ghcloud/cube-slide-rail-service'
import { authStore } from '@/api/auth-store'
import type { MetaInfoState } from '@/types/slide'

export const Entry = defineComponent({
  setup: () => {
    const router = useRoute()
    const { left, right } = router.query as { left: string; right: string; }
    const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
    const cubeMeattradeService = new CubeMeattradeService(authStore)
    const metaInfo = ref(new Map<string, MetaInfoState>())
    const getTallyData = async (deviceId: string): Promise<void> => {
      try {
        const [deviceRes, slideRes] = await Promise.all([
          cubeDeviceCenterService.getNorthDeviceDetail({ deviceId }),
          cubeMeattradeService.getArrangeLastInfo({ deviceId })
        ])
        metaInfo.value.set(deviceId, { device: deviceRes, slide: slideRes })
      } catch {
      }
    }
    const getTallyCounterData = async (left: string | null, right: string | null): Promise<void> => {
      const deviceIds = [left, right].filter(e => !!e) as string[]
      await Promise.all(
        deviceIds.map(async e => {
          return getTallyData(e)
        })
      )

    }

    const refreshTime = 10
    let timer: string | number | NodeJS.Timeout | null | undefined = null
    onMounted(() => {
      getTallyCounterData(left, right)
      timer = setInterval(() => {
        getTallyCounterData(left, right)
      }, refreshTime * 1000)
    })
    onUnmounted(() => {
      timer && clearInterval(timer)
    })
    const renderTallyCounters = (): JSX.Element[] => {
      return Array.from(metaInfo.value.entries()).map(([deviceId, item], index) => (
        <TallyCounter key={deviceId + index} data={item} class={['animate__animated', 'animate__fadeIn']} />
      ))
    }
    return (): JSX.Element =>
      <Layout>
        {
          renderTallyCounters()
        }
      </Layout>
  }
})
