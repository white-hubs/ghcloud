import { defineComponent, provide } from 'vue'
import { Layout } from '../../components/layout/layout'
import { LeftPanel } from './components/left-panel/left-panel'
import { RightPanel } from './components/right-panel/right-panel'
import { BottomPanel } from './components/bottom-panel/bottom-panel'
import { useRouter } from 'vue-router'
import { MapMarkers } from '@/components/map-markers/map-markers'

export const Index = defineComponent({
  setup: () => {
    provide('dataType', 'sz')
    const router = useRouter()
    const handleMapClick = (): void => {
      router.push({ path: '/sub-area' })
    }
    // 定义深圳地图标记点数据
    const locationData = [
      {
        id: 1,
        name: '宝安区',
        area: 5661.04,
        x: 27,
        y: 37,
      },
      {
        id: 2,
        name: '大鹏新区',
        area: 3029.91,
        x: 62,
        y: 45,
      },
      {
        id: 3,
        name: '南山区',
        area: 97.32,
        x: 34,
        y: 46.5,
      },
      {
        id: 5,
        name: '龙岗区',
        area: 3203.10,
        x: 49,
        y: 35,
      },
      {
        id: 7,
        name: '龙华区',
        area: 849.00,
        x: 38,
        y: 34,
      },
      {
        id: 8,
        name: '坪山区',
        area: 4104.05,
        x: 56,
        y: 34,
      },
      {
        id: 9,
        name: '光明区',
        area: 13342.77,
        x: 32,
        y: 25,
      },
      {
        id: 10,
        name: '深汕特别合作区',
        area: 19749.97,
        x: 73,
        y: 25,
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
      <Layout v-slots={layoutSlots} onMapClick={ handleMapClick } />
  }
})
