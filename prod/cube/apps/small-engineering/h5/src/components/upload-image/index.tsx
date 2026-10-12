import { defineComponent, reactive, type PropType } from 'vue'
import { Uploader } from 'vant'
import { cubeFileService } from '../../api/server'
import type { FileState } from '@ghcloud/cube-file-service'
import type { UploaderFileListItem } from 'vant'
interface FileList {
  url: string;
  status: string;
  message: string;
}
export const UploadImage = defineComponent({
  props: {
    fileList: {
      type: Array as PropType<FileState[]>,
      default: () => []
    }
  },
  emits: ['update:fileList'],
  setup: (props, { emit }) => {
    const state = reactive<{
      fileList: FileList[];
    }>({
      fileList: []
    })
    const handleFileAfterRead = async (file: UploaderFileListItem | UploaderFileListItem[]): Promise<void> => {
      const fileList = []
      if (Array.isArray(file)) {
        for (const fileItem of file) {
          fileItem.status = 'uploading'
          fileItem.message = '上传中...'
          const payload = {
            businessKey: 'mdata',
            file: fileItem.file as Blob,
          }
          const fileInfo = await cubeFileService.uploadFile(payload)
          fileList.push(fileInfo)
          fileItem.url = fileInfo.path as unknown as string
          fileItem.status = 'done'
          fileItem.message = '上传成功'
        }
      } else {
        file.status = 'uploading'
        file.message = '上传中...'
        const payload = {
          businessKey: 'mdata',
          file: file.file as Blob,
        }
        const result = await cubeFileService.uploadFile(payload)
        fileList.push(result)
        file.url = result.path as unknown as string
        file.status = 'done'
        file.message = '上传成功'
      }
      emit('update:fileList', fileList)
    }
    return (): JSX.Element => (
      <Uploader v-model={state.fileList} afterRead={handleFileAfterRead} multiple maxCount={5} />
    )
  }
})
