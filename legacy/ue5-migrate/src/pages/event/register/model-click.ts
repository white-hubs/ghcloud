import { modelSDK } from '@/pages/model-sdk/sdk'
import { useStateStore } from '@/pages/state/use-state-store'
import { eventInstance } from '../event'
import type { CubeWeb3DEvents } from '@ghcloud/cube-visual-sdk/src/web-3d/web-3d'

const { getAreaById, globalState } = useStateStore()

modelSDK.modelClickEventRegister({
  onIconLabelClick: (event: CubeWeb3DEvents['icon-label-click']) => {
    if (event.type === 'BUILD_ICON'){
      const area = getAreaById(event.props.id as string)
      eventInstance.emitEvent('handelClickBuild', area)
    } else if (event.type === 'DEVICE_ICON'){
      globalState.panel.rightPanelName = ''
      globalState.panel.leftPanelName = 'deviceDetailsPanel'
      globalState.panel.universalPanelVo.left = null
      globalState.panel.universalPanelVo.right = null
      globalState.business.panelCurrentDeviceId = event.props.deviceId as string
      globalState.panel.visible = true
    }
  }
})
