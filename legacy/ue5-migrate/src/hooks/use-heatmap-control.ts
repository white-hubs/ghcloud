import { ref, onMounted, watch } from 'vue'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { modelSDK } from '@/pages/model-sdk/sdk'
import { restoreHeatmap } from '@/components/businessPanel/people-flow/hooks/use-people-flow'

export const useHeatmapControl = () => {
  const showHeatmapCheckbox = ref(false)
  const isHeatmapEnabled = ref(false)

  const getDictionary = async () => {
    try {
      const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
        itemCode: 'FRONTEND_CONFIG',
        code: 'bimops-manage-web'
      });
      if (res && res.variable) {
        try {
          const config = JSON.parse(res.variable)
          if (config?.feature?.switchModelOptions?.includes('heatmap')) {
            showHeatmapCheckbox.value = true
            isHeatmapEnabled.value = true
          }
        } catch (parseError) {
        }
      }
    } catch (e) {
    }
  }

  watch(isHeatmapEnabled, (newVal) => {
    if (newVal) {
      restoreHeatmap()
    } else {
      modelSDK.clearAllCoordPointsHeatMap()
    }
  })

  onMounted(() => {
    getDictionary()
  })

  return {
    showHeatmapCheckbox,
    isHeatmapEnabled
  }
}
