import { defineComponent } from 'vue'
import { Tabs as ATabs, type TabsProps } from 'ant-design-vue/es/'

type Key = string | number
export const Tabs = defineComponent({
  props: ['activeKey', 'type'],
  emits: ['tabChange', 'update:activeKey'],
  setup (props: TabsProps, { slots, emit }) {
    const tabsChange = (key: Key): void => {
      emit('tabChange', key)
      emit('update:activeKey', key)
    }
    return (): JSX.Element => {
      return <ATabs {...props} v-model:activeKey={props.activeKey} onChange={tabsChange}>{slots}</ATabs>
    }
  }
})
