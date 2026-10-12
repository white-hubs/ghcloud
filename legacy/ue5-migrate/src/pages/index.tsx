import { defineComponent, onMounted, ref } from 'vue'
import { Layout } from './components/layout/layout'
import { TitleBar } from './widget/title-bar/title-bar'
import { BusinessNav } from './widget/business-nav/business-nav'
import { useStateStore } from './state/use-state-store'
import { modelSDK } from '@/pages/model-sdk/sdk'
import { useIotSocket } from '@/utils/iotSocket'
import { BasePanelRender } from '@/components/businessPanel/base-panel-render/base-panel-render'
import '../style/index.less'
import { eventInstance } from './event/event'
import { AreaNav } from './widget/area-nav/area-nav'

export const ViewPage = defineComponent({
  setup: () => {
    useIotSocket()
    const { renderType, globalState } = useStateStore()
    const modelContainer = ref()
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <TitleBar />
      },
      'layout-left-penal': (): JSX.Element => {
        return <BasePanelRender
          panelName={globalState.panel.leftPanelName}
          universal-panel-vo={globalState.panel.universalPanelVo.left}
          show-panel={globalState.panel.visible}
          position='left'
        />
      },
      'layout-right-penal': (): JSX.Element => {
        return <BasePanelRender
          panelName={globalState.panel.rightPanelName}
          universal-panel-vo={globalState.panel.universalPanelVo.right}
          show-panel={globalState.panel.visible}
          position='right'
        />
      },
      'layout-area-tag': (): JSX.Element => {
        return <AreaNav />
      },
      'layout-menu': (): JSX.Element => {
        return <BusinessNav />
      }
    }
    const initModal = async (): Promise<void> => {
      // 初始化模型
      await modelSDK.initModal(modelContainer.value)
      // 模型加载成功
      await modelSDK.waitModalLoad()

      // 打楼栋(区域)标签
      eventInstance.emitEvent('createBuildIcon')
    }
    onMounted(() => {
      initModal()
    })
    return (): JSX.Element =>
      <>
        <Layout v-slots={layoutSlots}>
          {
            renderType === 'WEBGL' && <canvas id='player' style='width:100%;height:100%' ref={modelContainer} />
          }
          {
            renderType === 'UE5' && <div id='player' ref={modelContainer} />
          }
          {
            renderType === 'GIS' && <>
              <svg style="display: none;">
                <filter id="purple-sepia" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feColorMatrix type="matrix"
                    values="1 0 0 0 0
                            1 0 0 0 0
                            1 0 0 0 0
                            0 0 0 1 0"
                    in="SourceGraphic" result="colormatrix" />
                  <feComponentTransfer in="colormatrix" result="componentTransfer">
                    <feFuncR type="table" tableValues="0.39 0.22 0.03" />
                    <feFuncG type="table" tableValues="0.48 0.27 0.06" />
                    <feFuncB type="table" tableValues="0.63 0.38 0.13" />
                    <feFuncA type="table" tableValues="0 1" />
                  </feComponentTransfer>
                  <feBlend mode="normal" in="componentTransfer" in2="SourceGraphic" result="blend" />
                </filter>
                <filter id="text-filter" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
                  <feComponentTransfer>
                    <feFuncR type="linear" slope="1" intercept="0" />
                    <feFuncG type="linear" slope="1" intercept="0" />
                    <feFuncB type="linear" slope="1" intercept="0" />
                  </feComponentTransfer>
                </filter>
              </svg>
              <div id='cubeMapContainer' style='width:100%;height:100%;z-index:0' ref={modelContainer} />
            </>
          }
        </Layout>
      </>
  }
})
