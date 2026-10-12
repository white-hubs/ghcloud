import { ref, type PropType, watch, defineComponent } from 'vue'
import { fetchImages } from '@/packages/index'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import './index.less'
export const ChartGlobalImage = defineComponent({
  props: {
    chartConfig: {
      type: Object as PropType<CreateComponentType>,
      required: true
    }
  },
  setup: (props) => {
    const imageInfo = ref('')
    // 获取图片
    const fetchImageUrl = async (): Promise<void> => {
      imageInfo.value = await fetchImages(props.chartConfig)
    }
    watch(
      () => props.chartConfig.key,
      async () => fetchImageUrl(),
      {
        immediate: true
      }
    )
    return () => (
      <>
        <img class='list-img' v-lazy={imageInfo.value} alt='图表图片' />
      </>
    )
  },
})
