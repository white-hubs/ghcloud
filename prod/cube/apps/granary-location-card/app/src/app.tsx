import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import './app.less'

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <div class='granary-location-card-app'>
        <RouterView />
      </div>
    )
  },
})
