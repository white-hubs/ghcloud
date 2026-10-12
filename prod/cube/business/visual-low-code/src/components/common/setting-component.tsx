import {
  defineComponent,
  h,
  resolveComponent,
} from 'vue'
import { settingComponents } from '@/utils/index'
export default defineComponent({
  name: 'SettingComponent',
  components: {
    ...settingComponents(),
  },
  props: {
    component: {
      type: String,
      required: true,
    },
    style: {
      type: Object,
    }
  },

  setup (props) {
    return () => h(resolveComponent(props.component), { ...props })
  },
})
