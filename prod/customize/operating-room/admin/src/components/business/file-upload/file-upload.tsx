import { Button, InboxOutlined, Upload, UploadDragger, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
// import { getNowEnterprise } from '../utils/auth'
// import { uploadFile } from '../api/file-upload'
import { cubeFileService } from '@/api/service'
import styles from './file-upload.module.less'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface Props {
  readonly: boolean;
  multiple: boolean;
  showtext: boolean;
  value: OSSFile[];
  size: number;
  typelist: string[];
  maxNum?: number;
  customText?: string;
  type: 'text' | 'picture' | 'picture-card';
  customupload?: boolean;
  dragger?: boolean;
  maxCount?: number;
}
type UploadStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed'
interface FileListItem {
  uid: string;
  name: string;
  status: UploadStatus;
  url: string;
}
export interface OSSFile {
  businessKey?: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
export const FileUpload = defineComponent({
  props: ['maxCount', 'readonly', 'multiple', 'value', 'showtext', 'size', 'typelist', 'customText', 'type', 'maxNum', 'customupload', 'dragger'],
  emits: ['update:value', 'start', 'end', 'file'],
  setup (props: Props, { emit, expose }) {
    const files = ref<OSSFile[]>(props.value ?? [])
    const fileList = ref<FileListItem[]>([])
    watch(() => props.value, (newValue) => {
      files.value = newValue ?? []
      fileList.value = files.value.map(e => {
        return {
          uid: e.id,
          name: e.name,
          status: 'done',
          url: e.path
        }
      })
    }, { immediate: true, deep: true })

    const beforeUpload = (file: File, filelist: unknown[]): boolean => {
      if (props.showtext) {
        const fileName = file.name
        const fileType = fileName.slice(fileName.lastIndexOf('.')) || ''
        if (props.typelist.includes(fileType)) {
          return true
        } else {
          message.warning({ key: '1', content: '只能上传对应类型的文件' })
          return false
        }
      }
      if (filelist.length > 5 - fileList.value.length) {
        message.warning({ key: '1', content: '最多上传5个文件' })
        return false
      }
      return true
    }
    const customRequest = async (data: { file: File & { uid: string; }; }): Promise<void> => {
      if (props.showtext) {
        if (data.file.size / 1024 > 1024 * props.size) {
          message.warning(`附件上传大小不能超过${props.size}MB`)
          return
        }
      }
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
          status: props.customupload ? 'done' : 'uploading',
          url: '',
        }
        fileList.value = [...fileList.value, fileInfo]
        emit('start')
        const formData = new FormData()
        formData.append('file', data.file)
        formData.append('businessKey', 'maintain')
        const lastIndex = fileList.value.length - 1
        if (props.customupload) {
          emit('file', data.file)
          emit('update:value', files.value)
          return
        }

        const res = await cubeFileService.uploadFile({
          sceneCode: GLOBAL_SCENE_CODE.medicalCleanliness,
          businessKey: 'maintain',
          file: data.file,
        })
        if (res) {
          fileList.value[lastIndex].url = res.path as unknown as string
          fileList.value[lastIndex].status = 'success'
          files.value.push(res as unknown as OSSFile)
          emit('file', files.value)
          emit('update:value', files.value)
        }
      } catch (error) {

        fileList.value.pop()
        emit('end', files.value)
      } finally {
        emit('end', files.value)
      }
    }
    const remove = (obj: FileListItem): void => {
      const index = fileList.value.findIndex(e => e.uid === obj.uid)
      if (index !== -1) {
        fileList.value.splice(index, 1)
        files.value.splice(index, 1)
        emit('file', files.value)
        emit('update:value', files.value)
      }
    }

    const previewFile = async (file: { url: string; name: string; }): Promise<void> => {
      if (props.type === 'picture-card') {
        window.open(file.url)
        return
      }

      try {
        message.loading('开始下载')
        const downloadUrl = file.url
        await fetch(downloadUrl).then(async (res) =>
          res.blob().then((blob) => {
            const a = document.createElement('a')
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = file.name
            a.click()
            window.URL.revokeObjectURL(url)
          }))
        message.destroy()
        message.success('下载成功')
      } catch {
        message.destroy()
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
      emit('file', files.value)
      emit('update:value', files.value)
    }
    expose({
      triggerUpload,
      clearAll
    })
    return (): JSX.Element=> {
      const placeholder = (
        <span class={styles.placeholder}>
          {props.customText ? props.customText : '支持上传图片（.png/.jpeg/.jpg）、视频（MP4、AVI、MKV）、文档（.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf）,最大为300MB'}
        </span>
      )
      const uploadBtn = props.maxNum && fileList.value.length === props.maxNum ? null : (props.type === 'picture-card' ? <div class='cube-ui-upload-text'>+<p>上传</p></div> : <Button type='primary' shape='round' ref={uploadBtnRef} class='cube-ui-file-upload-btn'>上传附件</Button>)
      const uploadBody = (
        <div class='cube-upload'>
          <Upload
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            onRemove={remove}
            maxCount={props.maxCount}
            multiple={props.multiple}
            file-list={fileList.value}
            disabled={props.readonly}
            onPreview={previewFile}
            list-type={props.type}
          >
            {!props.readonly && uploadBtn}
          </Upload>
          {!props.readonly && placeholder}
        </div>
      )
      const uploadDraggerBody = (
        <div class='cube-upload'>
          <UploadDragger
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            onRemove={remove}
            maxCount={props.maxCount}
            multiple={props.multiple}
            file-list={fileList.value}
            disabled={props.readonly}
            onPreview={previewFile}
            list-type={props.type}
          >
            {!props.readonly &&
              <div>
                <Button type='link'><InboxOutlined style='font-size:36px;' /></Button>
                <p style='margin:10px 0;'>单击或拖动文件到此区域进行上传，支持扩展名：.xls .xlsx</p>
              </div>}
          </UploadDragger>
          {!props.readonly && placeholder}
        </div>
      )
      return props.dragger ? uploadDraggerBody : uploadBody
    }
  }
})
