import { defineComponent } from 'vue'
import { MapContainer } from './components/map-container/map-container'
import { ClientLayout } from '@/components/client-layout/client-layout'
import { Header } from './components/header/header'
import { LeftSide } from './components/left-side/left-side'
import { RightSide } from './components/right-side/right-side'
import { Footer } from './components/footer/footer'
export const Index = defineComponent({
  setup: () => {
    const layoutSlots = {
      header: (): JSX.Element => {
        return <Header />
      },
      'left-side': (): JSX.Element => {
        return <LeftSide />
      },
      'right-side': (): JSX.Element => {
        return <RightSide />
      },
      footer: (): JSX.Element => {
        return <Footer />
      }
    }
    return (): JSX.Element => (
      <ClientLayout v-slots={layoutSlots}>
        <MapContainer />
      </ClientLayout>
    )
  }
})
