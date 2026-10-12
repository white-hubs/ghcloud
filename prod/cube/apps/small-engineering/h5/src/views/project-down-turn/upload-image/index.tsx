import { defineComponent, reactive, ref, type PropType } from 'vue'
import { Uploader } from 'vant'
import { cubeFileService } from '@/api/server'
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
  emits: ['fileList'],
  setup: (props, { emit }) => {
    const state = reactive<{
      fileList: FileList[];
    }>({
      fileList: []
    })
    const fileListData = ref<FileState[]>([])
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
      fileListData.value.push(...fileList)
      emit('fileList', fileListData.value)
    }
    const deleteFile = (file: UploaderFileListItem): void => {
      fileListData.value = fileListData.value.filter((item) => item.path !== file.url)
      emit('fileList', fileListData.value)
    }
    const beforeRead = (): boolean => {
      return true
    }
    return (): JSX.Element => (
      <Uploader v-model={state.fileList} accept='image/*' before-read={beforeRead} onDelete={deleteFile} afterRead={handleFileAfterRead} multiple maxCount={5} />
    )
  }
})
