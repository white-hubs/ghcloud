import { defineComponent, nextTick, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
const imageBg = "/resource/v1/visual-low-code/images/exception/image-comp.svg"
import { getComponentByType } from '@/utils'
import { type CreateComponentType, ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { Carousel } from '@ghcloud/visual-view-ui'
export default defineComponent({
  name: 'image',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const imageComponent = ref<CreateComponentType | null>()
    const imgList = ref([])
    watch(() => chartEditStore.active.pageId, () => {
      imageComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.IMAGE)
      imgList.value = imageComponent.value?.config.imgList ?? []
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        imageComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.IMAGE)
        imgList.value = imageComponent.value?.config.imgList ?? []
      })
    }, { immediate: true, deep: true })
    const carouselSlots = {
      default: () => {
        return imgList.value.map((item: { id: string | number | symbol | undefined; url: string | undefined; }) => {
          return <img key={item.id ?? ''} style={{ width: props.style.width, height: props.style.height, margin: '0 auto', textAlign: 'center' }} src={item.url ?? ''} />
        })
      }
    }
    return () => (
      <div style={{ ...props.style, position: 'relative' }}>
        {
        imageComponent.value?.config.rotationSettings
          ? <Carousel autoplay interval={imageComponent.value?.config.rotationTime * 1000} v-slots={carouselSlots} />
          : <div style={{ width: props.style.width, height: props.style.height, margin: '0 auto', textAlign: 'center', backgroundImage: `url(${imgList.value && imgList.value.length > 0 ? imgList.value[0].url : imageBg})`, backgroundSize: '100% 100%', backgroundPosition: '50% 50%', backgroundRepeat: 'no-repeat' }} />
        }
      </div>
    )
  },
})
