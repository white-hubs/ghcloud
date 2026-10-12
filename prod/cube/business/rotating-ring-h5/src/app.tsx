import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'

export const App = defineComponent({
  setup: () => {
    return () => (
      <RouterView />
    )
  }
})
