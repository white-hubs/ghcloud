import { defineComponent, type PropType } from 'vue'
import { ImagePreviewGroup, Modal, Image } from '@ghcloud/cube-ui'
import type { OSSFile } from '@/components/business/file-upload/file-upload'
export const PreviewImages = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    previewImages: {
      type: Array as PropType<OSSFile[]>,
      default: []
    }
  },
  emits: ['update:visible'],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <Modal
        visible={props.visible} width='600px' footer={null} onCancel={
          () => {
            emit('update:visible', false)
          }
        }
      >
        <ImagePreviewGroup>
          {props.previewImages.map((item: OSSFile) => {
            return (
              <Image key={item.id} src={item.path} width={120} height={120} alt={item.name} />
            )
          })}
        </ImagePreviewGroup>
      </Modal>
    )
  }
})
