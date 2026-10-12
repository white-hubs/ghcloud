import { defineComponent } from 'vue'
import { Upload, type UploadProps, type UploadFile } from 'ant-design-vue/es'
export default defineComponent({
  props: ['accept', 'customRequest', 'beforeUpload', 'remove', 'disabled', 'fileList', 'maxCount', 'multiple'],
  emits: ['preview', 'change', 'remove'],
  setup (props: UploadProps, { slots, emit }) {
    return (): JSX.Element => (
      <Upload {...props} onRemove={((file: UploadFile) => {
        emit('remove', file)
      })} onPreview={(file: UploadFile) => {
        emit('preview', file)
      }} onChange={(file) => {
        emit('change', file)
      }}>
        {slots.default?.()}
      </Upload>
    )
  }
})
