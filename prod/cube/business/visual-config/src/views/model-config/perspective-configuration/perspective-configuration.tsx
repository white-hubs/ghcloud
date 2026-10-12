
import { GLayout } from '@/components/common/layout'
import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'
import { PerspectiveUe5 } from './components/perspective-ue5'
import { getModelConfig } from '@/api/model'
import { PerspectiveWebGl } from './components/perspective-web-gl'
import { useUtils } from '@/hooks/use-utils'

export const PerspectiveConfiguration = defineComponent({
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
          <div>
            <Tabs>
              <TabPane key={getVisualType(modelConfigObj.value.entry)} tab={getVisualType(modelConfigObj.value.entry)}>
                {modelConfigObj.value.entry === 'views' && <PerspectiveUe5 data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
                {['views-three', 'views-3d'].includes(modelConfigObj.value.entry) && <PerspectiveWebGl data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
              </TabPane>
            </Tabs>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='视角配置' showFooter v-slots={gLayoutSlots} />
      </>
  }
})
