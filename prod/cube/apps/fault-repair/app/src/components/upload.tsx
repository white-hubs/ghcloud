import { defineComponent, ref, watch, type PropType } from 'vue'
import { Upload, message, PlusOutlined } from '@ghcloud/cube-ui'
import type { UploadChangeParam, UploadFile, UploadRequestOption } from '@ghcloud/cube-ui'
import { getNowEnterprise, getToken } from '@ghcloud/generic-component/src/utils/auth'
import { cubeFileService } from '@/api/service'

interface Props {
  accept?: string;
  listType?: 'text' | 'picture' | 'picture-card';
  max?: number;
  file: UploadFile[];
  value: string | number;
  businessKey: string;
}
export const GUpload = defineComponent({
  emits: ['update:value', 'changeFile'],
  props: {
    accept: {
      type: String,
      default: '.png,.jpj,.jpeg,.svg'
    },
    listType: {
      type: String as PropType<'text' | 'picture' | 'picture-card'>,
      default: 'picture-card'
    },
    max: {
      type: Number,
      default: 1,
    },
    file: {
      type: Array as PropType<UploadFile[]>,
      default: () => []
    },
    value: {
      type: [String, Number],
      default: []
    },
    businessKey: {
      type: String,
      default: 'mdata'
    },
  },
  setup (props: Props, { emit, expose }) {
    const headers = {
      Authorization: `Bearer ${getToken().accessToken}`,
      terminal: window.config.terminal,
      tenant: getNowEnterprise().code,
    }
    const max = props.max ?? 1
    const fileIds = ref<unknown[]>([])
    const fileList = ref<UploadFile[]>(props.file || [])
    const customRequest = async (file: UploadRequestOption): Promise<void> => {
      if (file.onProgress) {
        file.onProgress({})
      }
      const data = await cubeFileService.uploadFile({
        file: file.file as Blob,
        tenant: getNowEnterprise().code,
        businessKey: props.businessKey,
      })
      if (data?.id) {
        fileIds.value.push(data)
        if (file.onSuccess) file.onSuccess({ data })
      }
    }
    const beforeUpload = (file: UploadFile): boolean => {
      let accepts: string[] = []
      if (props.accept) { accepts = props.accept.split(',') }
      let isJpgOrPng = false
      accepts.forEach((item) => {
        if (file.name.includes(item)) {
          const name = file.name.split(item)
          if (name.length === 2 && name[1] === '') {
            isJpgOrPng = true
          }
        }
      })
      let isLt2M = true
      if (file.size) {
        isLt2M = file.size / 1024 / 1024 < 200
        if (!isLt2M) {
          message.error('上传文件不能超多200M')
        }
      }
      return isJpgOrPng && isLt2M
    }
    const remove = async (file: UploadFile): Promise<boolean> => {

      return true
    }
    const handleChange = (info: UploadChangeParam): void => {
      if (info.file.status) {
        let resFileList = [...info.fileList]
        const updateFiles: unknown[] = []
        resFileList = resFileList.map((file) => {
          if (file.response) {
            file.url = file.response.data.path
          }
          return file
        })
        fileList.value = resFileList
        let fileId: unknown[] = []
        fileList.value.forEach((item: UploadFile) => {
          if (item.response?.data && item.status === 'done') {
            fileId.push(item.response.data.id)
            updateFiles.push(item.response.data)
          } else if (fileIds.value.length) {
            fileId = fileIds.value
          }
        })
        if (info.file.status === 'done' || info.file.status === 'removed') {
          if (Array.isArray(fileId)) {
            emit('update:value', updateFiles)
            emit('changeFile', fileId, '')
          }
        }
      }
    }
    const previewFile = (file: UploadFile): void => {
      const response = file.response as { data: { path: string; }; }
      if (response) {
        if (response.data.path.includes('.txt')) {
          window.open(
            response.data.path + '?response-content-type=application/octet-stream'
          )
        } else {
          window.open(file.response.data.path)
        }
      } else if (file.url) {
        if (file.url.includes('.txt')) {
          window.open(file.url + '?response-content-type=application/octet-stream')
        } else {
          window.open(file.url)
        }
      }
    }
    watch(
      () => props.file,
      () => {
        fileList.value = props.file
      }
    )
    const clearAll = (): void => {
      fileList.value = []
    }

    expose({
      clearAll
    })
    return () =>
      <>
        <Upload
          accept={props.accept}
          customRequest={customRequest}
          before-upload={beforeUpload}
          list-type={props.listType}
          file-list={fileList.value}
          headers={headers}
          onRemove={remove}
          onPreview={previewFile}
          onChange={handleChange}
        >
          {
      props.listType === 'picture-card' && fileList.value.length < max
        ? (
          <div>
            <PlusOutlined />
            <div class='ant-upload-test'>上传</div>
          </div>
          )
        : null
}
        </Upload>
      </>
  }
})
