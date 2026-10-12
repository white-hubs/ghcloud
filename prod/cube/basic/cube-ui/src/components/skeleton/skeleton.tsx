import { defineComponent } from 'vue'
import { Skeleton as ASkeleton, type SkeletonProps } from 'ant-design-vue/es'
export const Skeleton = defineComponent({
  setup (props: SkeletonProps, { slots }) {
    return (): JSX.Element => <ASkeleton {...props} v-slots={slots} />
  }
})
