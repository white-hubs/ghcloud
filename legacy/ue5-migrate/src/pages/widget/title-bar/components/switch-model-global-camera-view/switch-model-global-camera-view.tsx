import { Dropdown } from 'ant-design-vue'
import { defineComponent, ref } from 'vue'
import styles from './switch-model-global-camera-view.module.less'
import { getAssetsImage } from '@/utils/getImage'
import { eventInstance } from '@/pages/event/event'
import { ConfigLoader } from '@/pages/config-loader'
import { storeHead } from '@/pages/state/use-state-head'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import { useStateStore } from '@/pages/state/use-state-store'

/** 切换模型全局视角 */
export const SwitchModelGlobalCameraView = defineComponent({
  setup () {
    const { renderType } = useStateStore()
    const piniaStoreHead = storeHead()
    const options = ref(ConfigLoader.config.modelPerspective)
    piniaStoreHead.perspectiveSelected = options.value[0]

    renderType === 'UE5' && UeClient.getInstance().onConnected(function (){
      eventInstance.emitEvent('setFirstPerspective')
    })

    function handleClick (index): void {
      eventInstance.emitEvent('setFirstPerspective', index)
    }

    return (): JSX.Element =>
      <Dropdown
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        v-slots={
          {
            overlay: () => {
              return (
                <div class={styles.list}>
                  {
                    options.value.map((item, index) => {
                      return (
                        <div class={styles['list-item']} key={item.value} onClick={() => {
                          handleClick(index)
                        }}>
                          <span>{item.label}</span>
                        </div>
                      )
                    })
                  }
                </div>
              )
            }
          }
        }
      >
        <div class={styles.box}>
          <img src={getAssetsImage('camera.png')} />
          <span>{piniaStoreHead.perspectiveSelected?.label || '默认'}</span>
        </div>
      </Dropdown>
  }
})
