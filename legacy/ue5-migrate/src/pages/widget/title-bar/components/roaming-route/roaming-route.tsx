import { Dropdown } from 'ant-design-vue'
import { defineComponent, ref } from 'vue'
import styles from './roaming-route.module.less'
import { eventInstance } from '@/pages/event/event'
import { ConfigLoader } from '@/pages/config-loader'

/** 漫游路线 */
export const RoamingRoute = defineComponent({
  setup () {
    const options = ref(ConfigLoader.config.roamingRoute ?? [])
    const selected = ref<{
      label: string;
      value: string;
    }>()

    function handleClick (item): void {
      selected.value = item
      eventInstance.emitEvent('changeModelTime', item)
    }

    return (): JSX.Element => <>
      <Dropdown
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        v-slots={
          {
            overlay: () => {
              return (
                <div class={styles.list}>
                  {
                    options.value.map((item) => {
                      return (
                        <div class={styles['list-item']} key={item.value} onClick={() => {
                          handleClick(item)
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
        <div class={styles.box} v-show={options.value.length > 0}>
          <span>{selected.value ? selected.value.label : '漫游路线'}</span>
        </div>
      </Dropdown>
    </>
  }
})
