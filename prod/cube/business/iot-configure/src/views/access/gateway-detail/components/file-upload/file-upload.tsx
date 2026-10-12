import { Button, Upload, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { importExcel } from '@/utils/common'
interface Props {
  readonly: boolean;
  multiple: boolean;
  value: OSSFile[];
  channelId: string;
  fileFlag: string;
  fileTypes?: string[];
}
type UploadStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed'
interface FileListItem {
  uid: string;
  name: string;
  status: UploadStatus;
  url: string;
}
export interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
export const FileUpload = defineComponent({
  props: ['readonly', 'multiple', 'value', 'channelId', 'fileFlag', 'fileTypes'],
  emits: ['update:value', 'start', 'end', 'success'],
  setup (props: Props, { emit, expose }) {
    const files = ref<OSSFile[]>(props.value ?? [])
    const fileList = ref<FileListItem[]>([])

    const beforeUpload = (file: File, filelist: unknown[]): boolean => {
      if (filelist.length > 5 - fileList.value.length) {
        message.error({ key: '1', content: '最多上传5个文件' })
        return false
      }
      const extension = file.name.substring(file.name.lastIndexOf('.'))
      if (props.fileTypes && !props.fileTypes?.includes(extension)) {
        message.warning(`仅限上传${props.fileTypes.join('、')}格式!`)
        return false
      }
      return true
    }
    const customRequest = async (data: { file: File & { uid: string; }; }): Promise<void> => {
      if (data.file.size / 1024 > 1024 * 300) {
        message.warning('附件上传大小不能超过300MB')
        return
      }
      try {
        if (!props.multiple) {
          files.value = []
          fileList.value = []
        }
        const fileInfo: FileListItem = {
          uid: data.file.uid,
          name: data.file.name,
          status: 'uploading',
          url: '',
        }
        fileList.value = [...fileList.value, fileInfo]
        emit('start')
        const formData = new FormData()
        formData.append('channelId', props.channelId)
        formData.append('file', data.file)
        if (props.fileFlag === '1') {
          const res = await importExcel('/api/excel/importCtl', formData)
          emit('success', res)
        } else if (props.fileFlag === '2') {
          const res = await importExcel('/api/excel/importCtlAndVar', formData)
          emit('success', res)
        } else if (props.fileFlag === '3') {
          const res = await importExcel('/api/excel/importVar', formData)
          emit('success', res)
        }
      } catch {
        message.error('网络异常')
        fileList.value.pop()
        emit('end')
      } finally {
        emit('end')
      }
    }
    const remove = (obj: FileListItem): void => {
      const index = fileList.value.findIndex(e => e.uid === obj.uid)
      if (index !== -1) {
        fileList.value.splice(index, 1)
        files.value.splice(index, 1)
        emit('update:value', files.value)
      }
    }

    onMounted(() => {
      fileList.value = files.value.map(e => {
        return {
          uid: e.id,
          name: e.name,
          status: 'done',
          url: e.path
        }
      })
    })

    const uploadBtnRef = ref<{ click: () => void; }>()
    const triggerUpload = (): void => {
      const dom = document.querySelector('.cube-ui-file-upload-btn')
      if (dom) {
        (dom as HTMLElement).click()
      }
    }
    const clearAll = (): void => {
      fileList.value = []
      files.value = []
      emit('update:value', files.value)
    }

    expose({
      triggerUpload,
      clearAll
    })

    return (): JSX.Element => {
      const uploadBtn = <Button type='primary' shape='round' ref={uploadBtnRef} class='cube-ui-file-upload-btn'>上传附件</Button>
      const uploadBody = (
        <>
          <Upload
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            remove={remove}
            multiple={props.multiple}
            file-list={fileList.value}
            disabled={props.readonly}
          >
            {!props.readonly && uploadBtn}
          </Upload>
        </>
      )
      return uploadBody
    }
  }
})
