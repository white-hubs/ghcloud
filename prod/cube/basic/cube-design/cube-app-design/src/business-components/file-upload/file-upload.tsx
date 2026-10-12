import { Button, InboxOutlined, Upload, UploadDragger, message, ImagePreviewGroup, Image } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './file-upload.module.less'
import { Base64 } from 'js-base64'
import { getAppAuthStore } from '../../utils/index'
import { cubeFileService } from '../../api/service'

interface Props {
  readonly: boolean;
  multiple: boolean;
  showText: boolean;
  value: OSSFile[];
  size: number;
  typeList: string[];
  customText?: string;
  type: 'text' | 'picture' | 'picture-card';
  customUpload?: boolean;
  dragger?: boolean;
  maxCount?: number;
  sceneCode?: string;
  businessKey?: string;
  useTemporaryUpload?: boolean;
  accept?: string;
  buttonText?: string;
}
type UploadStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed'
interface FileListItem {
  uid: string;
  name: string;
  status: UploadStatus;
  customUrl?: string;
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
  props: ['readonly', 'multiple', 'value', 'showText', 'size', 'typeList', 'customText', 'type', 'maxCount', 'customUpload', 'dragger', 'sceneCode', 'businessKey', 'useTemporaryUpload', 'accept', 'buttonText'],
  emits: ['update:value', 'start', 'end', 'file', 'error'],
  setup (props: Props, { emit, expose }) {
    const files = ref<OSSFile[]>(props.value ?? [])
    const fileList = ref<FileListItem[]>([])
    const current = ref<number>(0)
    const previewVisible = ref<boolean>(false)
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

    const beforeUpload = (file: File, list: unknown[]): boolean => {
      if (props.showText) {
        const fileName = file.name
        const fileType = fileName.slice(fileName.lastIndexOf('.')) || ''
        if (props.typeList.includes(fileType)) {
          return true
        } else {
          message.warning({ key: '1', content: '只能上传对应类型的文件' })
          return false
        }
      }
      const maxCount = props.maxCount ?? 5
      if (list.length > maxCount) {
        message.warning({ key: '1', content: `最多上传${props.maxCount}个文件` })
        return false
      }

      return true
    }
    const customRequest = async (data: { file: File & { uid: string; }; }): Promise<void> => {
      if (props.size) {
        if (data.file.size / 1024 > 1024 * props.size) {
          message.warning(`附件上传大小不能超过${props.size}MB`)
          return
        }
      }
      try {
        if (!props.multiple) {
          files.value = []
          fileList.value = []
        }

        const fileInfo: FileListItem = {
          uid: data.file.uid,
          name: data.file.name,
          status: props.customUpload ? 'done' : 'uploading',
          customUrl: '',
          url: '',
        }
        fileList.value = [...fileList.value]
        emit('start')
        if (props.customUpload) {
          const blob = new Blob([data.file])
          const url = URL.createObjectURL(blob)
          fileInfo.customUrl = url
          emit('file', data.file)
          fileList.value = [...fileList.value, fileInfo]
          emit('update:value', files.value)
          return
        }
        const authStore = getAppAuthStore().authStore
        const res = await cubeFileService.uploadFile({
          file: data.file,
          tenant: authStore.tenant,
          businessKey: props.businessKey ?? 'maintain',
          sceneCode: props.sceneCode ?? '',
          useTemporary: props.useTemporaryUpload,
        })
        if (res) {
          fileInfo.status = 'success'
          fileList.value = [...fileList.value, fileInfo]
          files.value.push(res as OSSFile)
          emit('file', files.value)
          emit('update:value', files.value)
        }
      } catch (error) {
        emit('error', error)
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

    const previewFile = async (obj: { url: string; name: string;customUrl?: string; }): Promise<void> => {
      const index = obj.name.lastIndexOf('.') // （考虑严谨用lastIndexOf(".")得到）得到"."在第几位
      const fileValueSuffix = obj.name.substring(index) // 截断"."之前的，得到后缀
      let fileType = ''
      if (/(.*)\.(mp4|avi|wmv|MP4|AVI|WMV|flv)$/.test(fileValueSuffix)) {
        fileType = 'video'
      } else if (/(.*)\.(jpg|JPG|bmp|BMP|mpg|MPG|mpeg|MPEG|tis|TIS|png|gif|jpge|svg|webp|jpeg)$/.test(fileValueSuffix)) { // 根据后缀，判断是否符合图片格式
        fileType = 'image'
      } else if (/(.*)\.(xls|XLS|xlsx|XLSX)$/.test(fileValueSuffix)) {
        fileType = 'excel'
      } else if (/(.*)\.(doc|DOC)$/.test(fileValueSuffix)) {
        fileType = 'doc'
      } else if (/(.*)\.(docx|DOCX)$/.test(fileValueSuffix)) {
        fileType = 'docx'
      } else if (/(.*)\.(PPT|PPTX|ppt|pptx)$/.test(fileValueSuffix)) {
        fileType = 'ppt'
      } else if (/(.*)\.(pdf|PDF)$/.test(fileValueSuffix)) {
        fileType = 'pdf'
      } else if (/(.*)\.(mp3|wav|m4a)$/.test(fileValueSuffix)) {
        fileType = 'audio'
      } else {
        fileType = 'unknown'
      }
      if (['doc', 'docx', 'excel', 'pdf', 'ppt'].includes(fileType) && !props.customUpload) {
        if (!obj.url.includes('http')) {
          obj.url = window.location.origin + obj.url
        }
        window.open(`${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(Base64.encodeURL(obj.url))}&fileName=${obj.name}`)
        return
      }
      if (fileType === 'image') {
        const index = fileList.value.findIndex(e => e.url === obj.url)
        current.value = index
        previewVisible.value = true
        return
      }
      if (props.customUpload) {
        const downloadElement = document.createElement('a')
        downloadElement.href = obj.customUrl ? obj.customUrl : obj.url
        downloadElement.download = obj.name
        downloadElement.click()
        return
      }
      window.open(obj.url)
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

    return (): JSX.Element => {
      const placeholder = (
        <span class={styles.placeholder} v-show={props.showText ?? true}>
          {props.customText ? props.customText : '支持上传图片（.png/.jpeg/.jpg）、视频（MP4、AVI、MKV）、文档（.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf）,最大为300MB'}
        </span>
      )
      const uploadBtn = props.maxCount && fileList.value.length === props.maxCount ? null : (props.type === 'picture-card' ? <div class="cube-ui-upload-text">+<p>{props.buttonText ?? '上传'}</p></div> : <Button type='primary' shape='round' ref={uploadBtnRef} class='cube-ui-file-upload-btn'>{props.buttonText ?? '上传附件'}</Button>)
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
            accept={props.accept}
          >
            {!props.readonly && uploadBtn}
          </Upload>
          {!props.readonly && placeholder}
          <ImagePreviewGroup preview={{
            visible: previewVisible.value,
            // @ts-ignore
            current: current.value,
            onVisibleChange: (visible: boolean) => previewVisible.value = visible,
            onChange: (currentIndex: number) =>current.value = currentIndex
          }}>
            {fileList.value.map(item=>{
              return <Image src={item.url} style={{ display: 'none' }} key={item.uid} />
            })}
          </ImagePreviewGroup>
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
                <Button type="link" ><InboxOutlined style="font-size:36px;" /></Button>
                <p style="margin:10px 0;">单击或拖动文件到此区域进行上传</p>
              </div>
            }
          </UploadDragger>
          {!props.readonly && placeholder}
        </div>
      )
      return props.dragger ? uploadDraggerBody : uploadBody
    }
  }
})
