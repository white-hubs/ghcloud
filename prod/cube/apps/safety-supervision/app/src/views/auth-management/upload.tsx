import { defineComponent, ref } from 'vue'
import { Upload, PlusOutlined, type UploadFile } from '@ghcloud/cube-ui'
// import { uploadFile } from '@/api/supervise'
import { getNowEnterprise, getToken } from '@ghcloud/generic-component/src/utils/auth'
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
export default defineComponent({
  name: 'FeedbackModel',
  props: {
    value: {
      type: Array,
      default: []
    },
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit, expose }) => {
    const fileids = ref<string[]>([])
    const changefile = ({ file, fileList }: { file: { status: string; }; fileList: { response: {
    
        id: string;
     
    }; }[]; }): void => {
      if (file.status === 'done') {
        fileids.value = fileList.map(item => (item.response.data || item.response).id)
        emit('update:value', fileList.map(item => (item.response.data || item.response).id)[0])
        emit('change', fileList.map(item => (item.response.data || item.response).id)[0])
      }
    }
    const fileList = ref([])
    const fileremove = (file: { response: {
        id: string;
    }; }): boolean => {
      fileids.value = fileids.value.filter(item => item !== file.response.id)
      emit('update:value', fileids.value)
      return true
    }
    const setlist = (): void => {
      fileList.value = []
    }
    const previewFile = (file: UploadFile): void => {
      const response = file.response as { data: { path: string; }; }
      const data = response?.data || response
      if (response) {
        if (data.path.includes('.txt')) {
          window.open(
            data.path + '?response-content-type=application/octet-stream'
          )
        } else {
          window.open(data.path)
        }
      } else if (file.url) {
        if (file.url.includes('.txt')) {
          window.open(file.url + '?response-content-type=application/octet-stream')
        } else {
          window.open(file.url)
        }
      }
    }
    expose({
      setlist
    })
    return (): JSX.Element =>
      <>
        <Upload
          action='/api/file/file'
          accept='.jpeg,.jpg,.png'
          v-model:file-list={fileList.value}
          list-type='picture-card'
          max-count={1}
          onPreview={previewFile}
          onRemove={(file: { response: {
          
              id: string;
            
          }; }) => fileremove(file)}
          onChange={(file: { file: { status: string; }; fileList: { response: {
        
              id: string;
            
          }; }[]; }) => {
            changefile(file)
          }}
          headers={{
            Authorization: `
            Bearer ${getToken().accessToken}`,
            tenant: getNowEnterprise().code
          }}
          data={{
            businessKey: 'maintain',
            tenant: getNowEnterprise().code

          }}
        >
          <div>
            <PlusOutlined />
          </div>
        </Upload>
      </>
  }
})
