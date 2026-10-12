
import { getModelConfig } from '@/api/model'
import { GLayout } from '@/components/common/layout'
import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'
import { Ue5Model } from './components/ue5'
import { WebGlModel } from './components/web-gl'
import { Views2d } from './components/views-2d'
import { useUtils } from '@/hooks/use-utils'

export const IntroducingModels = defineComponent({
  setup: () => {
    const modelConfigObj = ref<ModelConfigItf>(modelConfigInit())
    const { getVisualType } = useUtils()
    const getModelConfigEvent = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfig = JSON.parse(res.modelConfiguration)
        if (Object.keys(modelConfig).length > 0) {
          modelConfigObj.value = modelConfig
          modelConfigObj.value.three = modelConfigObj.value.three ?? modelConfigObj.value.ue5
        }
      }
    }

    onMounted(async () => {
      getModelConfigEvent()
    })

    const gLayoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <Tabs>
            <TabPane key={getVisualType(modelConfigObj.value.entry)} tab={getVisualType(modelConfigObj.value.entry)}>
              {modelConfigObj.value.entry === 'views' && <Ue5Model data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
              {['views-three', 'views-3d'].includes(modelConfigObj.value.entry) && <WebGlModel data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
              {modelConfigObj.value.entry === 'views-2d' && <Views2d data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
            </TabPane>
          </Tabs>
        )
      }
    }
    return (): JSX.Element=>
      <>
        <GLayout title='引入模型' showFooter v-slots={gLayoutSlots} />
      </>
  }
})
