import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref } from 'vue'
import styles from './style.module.less'

interface Props {
  file: string;
}

export const PreviewGroup = defineComponent({
  props: ['file'],
  setup (props: Props, { slots }) {
    const currentTab = ref(props.file)
    const open = ref(false)

    const tabs = computed(() => {
      return [{
        component: slots[props.file],
        label: props.file,
      }]
    })

    return (): JSX.Element => (
      <div class={`${styles['preview-group']} ${!open.value ? styles.hide : ''}`}>
        <Tabs
          v-model:value={currentTab.value}
          v-slots={{
            rightExtra: () => (
              <div class={styles['close-icon']} onClick={() => {
                open.value = !open.value
              }}>
                code {open.value ? '↑' : '↓'}
              </div>
            )
          }}
        >
          {
            tabs.value.map((tab) => {
              return (
                <TabPane key={tab.label} tab={tab.label}>
                  {tab.component?.()}
                </TabPane>
              )
            })
          }
        </Tabs>
      </div>

    )
  }
})
