
import { defineComponent, ref, watch } from 'vue'
import { PanelSelectItem } from './panel-select-item'
import { Col, message, Row, Spin } from '@ghcloud/cube-ui'
import { getAreaScenePanelConfig } from '@/api/mdata'
import type { ReturnAreaScenePanelConfig } from '@/api/models/mdata'

interface Props {
  areaId: string;
  sceneType: string;
}

export const PanelSelect = defineComponent({
  props: ['areaId', 'sceneType'],
  setup (props: Props, { expose }) {
    const leftConfig = ref<ReturnAreaScenePanelConfig | null>(null)
    const rightConfig = ref<ReturnAreaScenePanelConfig | null>(null)
    const leftRef = ref<{ validate: () => Promise<boolean>; }>()
    const rightRef = ref<{ validate: () => Promise<boolean>; }>()
    const loading = ref(false)
    const requestAreaScenePanelConfig = async (): Promise<void> => {
      leftConfig.value = null
      rightConfig.value = null
      if (props.areaId && props.sceneType) {
        try {
          loading.value = true
          const res = await getAreaScenePanelConfig({
            areaId: props.areaId,
            sceneType: props.sceneType,
          })
          leftConfig.value = res.find((element) => element.panelPosition === 'LEFT_PANEL') ?? null
          rightConfig.value = res.find((element) => element.panelPosition === 'RIGHT_PANEL') ?? null
        } catch {
          message.error('获取配置失败')
        } finally {
          loading.value = false
        }
      }
    }

    watch(() => [props.areaId, props.sceneType], () => {
      requestAreaScenePanelConfig()
    }, { deep: true, immediate: true })

    async function validate (): Promise<void> {
      await leftRef.value?.validate()
      await rightRef.value?.validate()
    }
    function getConfig (): ReturnAreaScenePanelConfig[] {
      const res = [
        leftConfig.value,
        rightConfig.value
      ]
      return res.filter((element) => element !== null)
    }
    expose({
      validate,
      getConfig,
      requestAreaScenePanelConfig
    })

    return (): JSX.Element =>
      <Spin tip='加载中...' spinning={loading.value}>
        <Row justify='space-around'>
          <Col span={11}>
            <PanelSelectItem v-model:config={leftConfig.value} ref={leftRef} panelPosition='LEFT_PANEL' />
          </Col>
          <Col span={11}>
            <PanelSelectItem v-model:config={rightConfig.value} ref={rightRef} panelPosition='RIGHT_PANEL' />
          </Col>
        </Row>
      </Spin>
  }
})
