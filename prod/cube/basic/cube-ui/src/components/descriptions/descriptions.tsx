import { defineComponent } from 'vue'
import { Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem, type DescriptionsProps } from 'ant-design-vue/es'
import type { DescriptionsItemProp } from 'ant-design-vue/es/descriptions'

export const Descriptions = defineComponent({
  setup (props: DescriptionsProps, { slots }) {
    return (): JSX.Element => <ADescriptions {...props} v-slots={slots} />
  }
})
export const DescriptionsItem = defineComponent({
  setup (props: DescriptionsItemProp, { slots }) {
    return (): JSX.Element=> <ADescriptionsItem {...props} v-slots={slots} />
  }
})
