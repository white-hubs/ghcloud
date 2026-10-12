import { computed, defineComponent, ref } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
const imageBg = "/resource/v1/visual-low-code/images/exception/image-comp.svg"
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { useRouter } from 'vue-router'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'tdConfig',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const router = useRouter()
    const currentRoute = router.currentRoute
    const currentComp = ref<CreateComponentType | null>()
    // 获取当前二维组态组件
    currentComp.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.TDCONFIGURATION)
    const modelPath = computed(() => currentComp.value?.config?.modelPath)
    const bgImg = computed(() => modelPath.value ? '' : imageBg)
    return () => (
      <div style={{ ...props.style, position: 'relative' }}>
        {
          currentRoute.value.name === 'editor-config' ? <div style={{ width: props.style.width, height: props.style.height, position: 'absolute' }} /> : null
        }
        <div style={{ width: props.style.width, height: props.style.height, margin: '0 auto', textAlign: 'center', backgroundImage: `url(${bgImg.value})`, backgroundSize: '50% 50%', backgroundPosition: '50% 50%', backgroundRepeat: 'no-repeat' }}>
          {
            modelPath.value ? <iframe src={modelPath.value} frameborder='0' width='100%' height='100%' /> : null
          }
        </div>
      </div>
    )
  },
})
