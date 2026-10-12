import { defineComponent } from 'vue'
import { ImagePreviewGroup as AImagePreviewGroup, type ImageProps } from 'ant-design-vue/es'
export const ImagePreviewGroup = defineComponent({
  setup (props: ImageProps, { slots }) {
    return (): JSX.Element => <AImagePreviewGroup {...props}>{slots}</AImagePreviewGroup>
  }
})
