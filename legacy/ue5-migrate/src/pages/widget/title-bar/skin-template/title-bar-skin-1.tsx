import { defineComponent } from 'vue'
import styles from './tile-bar-skin-1.module.less'
const backImage = '/resource/v1/ue5-migrate/pages/widget/title-bar/assets/skin-1-bg.png'
import { ConfigLoader } from '@/pages/config-loader'
import { DateTime } from '../components/date-time/date-time'
import { SwitchModelTime } from '../components/switch-model-time/switch-model-time'
import { SwitchModelWeather } from '../components/switch-model-weather/switch-model-weather'
import { SwitchModelGlobalCameraView } from '../components/switch-model-global-camera-view/switch-model-global-camera-view'
import { RoamingRoute } from '../components/roaming-route/roaming-route'
import { SwitchModelQuality } from '../components/switch-model-quality/switch-model-quality'
import { SwitchModelTourAround } from '../components/switch-model-tour-around/switch-model-tour-around'
import { SwitchModelAlarm } from '../components/switch-model-alarm/switch-model-alarm'
import { SwitchDriveMode } from '../components/switch-drive-mode/switch-drive-mode'
import { SwitchTagVisible } from '../components/switch-tag-visible/switch-tag-visible'
import { SwitchMenuVisible } from '../components/switch-menu-visible/switch-menu-visible'
import { AlarmEntry } from '../components/alarm-entry/alarm-entry'
import { SwitchFullscreen } from '../components/switch-fullscreen/switch-fullscreen'
import { ChatAssistant } from '../components/chat-assistant/chat-assistant'
import { UeModalControl } from '../components/ue-modal-control/ue-modal-control'
import { useStateStore } from '@/pages/state/use-state-store'

/** 标题栏样式一 */
export const TitleBarSkin1 = defineComponent({
  setup: () => {
    const { globalState, renderType } = useStateStore()

    return (): JSX.Element => (
      <>
        <div class={styles['title-bar']}>
          <img class={styles['bar-background']} src={backImage} />
          <div class={styles['left-container']}>
            <DateTime />
            <SwitchModelTime />
            <SwitchModelWeather />
            <SwitchModelGlobalCameraView />
            {renderType === 'UE5' && <SwitchModelQuality />}
            <RoamingRoute />
          </div>
          <span class={styles['title-value']}>{ConfigLoader.config.systemName}</span>
          <div class={styles['right-container']}>
            <SwitchModelTourAround />
            {renderType === 'UE5' && <SwitchDriveMode />}
            <SwitchFullscreen />
            <SwitchTagVisible />
            <SwitchMenuVisible />
            <ChatAssistant />
            <AlarmEntry />
          </div>
        </div>
        {globalState.driveMode && <UeModalControl />}
      </>
    )
  }
})
