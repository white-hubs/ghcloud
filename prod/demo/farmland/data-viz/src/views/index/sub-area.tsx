import { defineComponent, provide } from 'vue'
import { Layout } from '../../components/layout/layout'
import { LeftPanel } from './components/left-panel/left-panel'
import { RightPanel } from './components/right-panel/right-panel'
import { BottomPanel } from './components/bottom-panel/bottom-panel'
import { useRouter } from 'vue-router'
import { MapMarkers } from '@/components/map-markers/map-markers'

export const SubArea = defineComponent({
  setup: () => {
    provide('dataType', 'sub-area')
    const router = useRouter()
    const handleMapBack = (): void => {
      router.push({ path: '/' })
    }

    // 定义地图标记点数据
    const locationData = [
      {
        id: 1,
        name: '赤石街道',
        area: 13586.12,
        x: 56,
        y: 45,
      },
      {
        id: 2,
        name: '鹅埠街道',
        area: 5520.15,
        x: 25,
        y: 54,
      },
      {
        id: 3,
        name: '鲘门街道',
        area: 602.70,
        x: 71,
        y: 58,
      },
      {
        id: 3,
        name: '小漠街道',
        area: 40.97,
        x: 46,
        y: 66,
      }
    ]

    const layoutSlots = {
      'leftPanel': (): JSX.Element => {
        return <LeftPanel />
      },
      'rightPanel': (): JSX.Element => {
        return <RightPanel />
      },
      'bottomPanel': (): JSX.Element => {
        return <BottomPanel />
      },
      'map': (): JSX.Element => {
        return <MapMarkers locations={locationData} />
      },
    }
    return (): JSX.Element =>
      <Layout v-slots={layoutSlots} onMapBack={ handleMapBack } />
  }
})
