import { defineComponent } from 'vue'
import styles from './workbench.module.less'
import { useClientUIState } from '../../../../hook/use-client'
import { CubeMessageEvent } from '@ghcloud/cube-protocol'

export interface WorkbenchTab {
  key: string;
  title: string;
  active: boolean;
}

export const Workbench = defineComponent({
  setup () {
    const clientUIState = useClientUIState()


    const switchTab = (index: number): void => {
      window.cubeElectronIpcRenderer.send(CubeMessageEvent.DESKTOP_SWITCH_TAB, index)
    };

    const closeTab = (index: number): void=> {
      window.cubeElectronIpcRenderer.send(CubeMessageEvent.DESKTOP_CLOSE_TAB, index)
    };


    return (): JSX.Element => (
      <div class={styles['tab-container']}>
        <div class={styles['tab-header']}>
          {(clientUIState.workbenchTabs).map((tab, index) => (
            <div
              key={tab.key}
              class={`${styles['tab-item']} ${tab.active ? styles['active'] : ''}`}
              onClick={() => switchTab(index)}
            >
              {tab.title}
              <button
                v-show={tab.active && index !== 0}
                class={styles['tab-close']} onClick={(e) => {
                  e.stopPropagation();
                  closeTab(index);
                }}>×</button>
            </div>
          ))}
        </div>
      </div>
    )
  },
})