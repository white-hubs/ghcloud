import { defineComponent } from 'vue'
import styles from './tile-bar-skin-gis.module.less'
import { ConfigLoader } from '@/pages/config-loader'
import { AlarmEntry } from '../components/alarm-entry/alarm-entry'
import { SwitchFullscreen } from '../components/switch-fullscreen/switch-fullscreen'
import { useStateStore } from '@/pages/state/use-state-store'
import type { SceneDataType } from '@/api/models/mdata'
const bgImg = '/resource/v1/ue5-migrate/pages/widget/title-bar/assets/skin-gis.webp'
import { eventInstance } from '@/pages/event/event'

/** 标题栏样式 GIS */
export const TitleBarSkinGis = defineComponent({
  setup: () => {
    const { globalState } = useStateStore()


    // 切换业务菜单
    async function switchNav (item: SceneDataType): Promise<void> {
      globalState.business.currentMenu = item.id
      eventInstance.emitEvent('switchBusinessPanel', true)
    }

    return (): JSX.Element => (
      <>
        <div class={styles['title-bar']}>
          <img class={styles['background-image']} src={bgImg} alt="Background" />
          <span class={styles['title-value']}>{ConfigLoader.config.systemName}</span>
          <div class={styles['menu-container']}>
            {
              globalState.business.menu.map(item => (
                <span class={`${styles['menu-item']} ${globalState.business.currentMenu === item.id ? styles['active'] : ''}`} key={item.id} onClick={()=>{
                  switchNav(item)
                }}>
                  <span>{item.name}</span>
                </span>
              ))
            }
          </div>
          <div class={styles['right-container']}>
            <SwitchFullscreen style={{ fontSize: '16px' }} />
            <AlarmEntry />
          </div>
        </div>
      </>
    )
  }
})
