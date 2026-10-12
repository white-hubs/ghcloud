import { defineComponent,ref } from 'vue'
// import { Upload, type UploadProps, type UploadFile } from 'ant-design-vue/es'
import { NUpload,UploadFileInfo } from 'naive-ui'

export default defineComponent({
  props: ['accept', 'listType','action','customRequest','headers','data','on-before-upload','max','fileList','multiple'],
  emits: ['preview','remove','change','finish','fileList'],
  setup (props, { slots, emit }) {
    const fileList=ref<UploadFileInfo[]>([])
    return () => (
      <NUpload {...props} 
      file-list={props.fileList}
      onPreview={(file:UploadFileInfo ) => { emit('preview', file) }} 
      onFinish={(options: { file: UploadFileInfo, event?: ProgressEvent }) => {emit('finish', options.file),emit('fileList',fileList.value) }}
      onRemove={(options: { file: UploadFileInfo, fileList: Array<UploadFileInfo> })=>{ emit('remove', options.file) }}
      onChange={(options: { file: UploadFileInfo, fileList: Array<UploadFileInfo>, event?: Event }) =>{ emit('change', options.file) } }>
        {slots.default?.()}
      </NUpload>
    )
  }
})
