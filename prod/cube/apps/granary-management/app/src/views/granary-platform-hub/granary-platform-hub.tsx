import { defineComponent } from 'vue'
import { Layout } from './layout'
import { PubSwiper } from './pub-swiper'
import './granary-platform-hub.less'

export const GranaryPlatformHub = defineComponent({
  name: 'GranaryPlatformHub',
  setup: () => {
    return (): JSX.Element => (
      <div class='granary-platform-hub-root'>
        <Layout>
          <PubSwiper />
        </Layout>
      </div>
    )
  },
})
