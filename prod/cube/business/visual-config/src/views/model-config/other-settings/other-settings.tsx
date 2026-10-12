
import { defineComponent, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { getModelConfig } from '@/api/model'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'
import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { OtherView2D } from './components/view-2d'
import { OtherViewUe } from './components/view-ue'
import { OtherViewThree } from './components/view-three'
import { useUtils } from '@/hooks/use-utils'
export const OtherSettings = defineComponent({
  setup: () => {
    const modelConfigObj = ref<ModelConfigItf>(modelConfigInit())
    const getModelConfigEvent = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfig = JSON.parse(res.modelConfiguration)
        if (Object.keys(modelConfig).length > 0) {
          modelConfigObj.value = modelConfig
          modelConfigObj.value.three = {
            ...modelConfigObj.value.three,
            scene: modelConfigObj.value.three.scene ? modelConfigObj.value.three.scene : modelConfigInit().three.scene,
          }
        }
      }
    }
    const { getVisualType } = useUtils()

    onMounted(async () => {
      getModelConfigEvent()
    })
    const gLayoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <div>
            <Tabs>
              <TabPane key={getVisualType(modelConfigObj.value.entry)} tab={getVisualType(modelConfigObj.value.entry)}>
                {modelConfigObj.value.entry === 'views-2d' && <OtherView2D data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
                {['views-three', 'views-3d'].includes(modelConfigObj.value.entry) && <OtherViewThree data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
                {modelConfigObj.value.entry === 'views' && <OtherViewUe data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
              </TabPane>
            </Tabs>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='其他设置' showFooter v-slots={gLayoutSlots} />
      </>
  }
})
