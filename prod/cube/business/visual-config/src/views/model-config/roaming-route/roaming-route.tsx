
import { defineComponent, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'

import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'
import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { getModelConfig } from '@/api/model'
import { RoamingRouteUe5 } from './components/roaming-route-ue5'
import { RoamingRouteThree } from './components/roaming-route-three'
import { useUtils } from '@/hooks/use-utils'
export const RoamingRoute = defineComponent({
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
      'content-data': (): JSX.Element=> {
        return (
          <div>
            <Tabs>
              <TabPane key={getVisualType(modelConfigObj.value.entry)} tab={getVisualType(modelConfigObj.value.entry)}>
                {modelConfigObj.value.entry === 'views' && <RoamingRouteUe5 data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
                {['views-three', 'views-3d'].includes(modelConfigObj.value.entry) && <RoamingRouteThree data={modelConfigObj.value} onGetModelData={getModelConfigEvent} />}
              </TabPane>
            </Tabs>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='漫游路线' showFooter v-slots={gLayoutSlots} />
      </>
  }
})
