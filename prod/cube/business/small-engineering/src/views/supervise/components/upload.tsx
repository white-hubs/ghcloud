import { defineComponent, ref } from 'vue'
import { Upload, PlusOutlined } from '@ghcloud/cube-ui'
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
  setup: (props, { emit }) => {
    const fileids = ref<string[]>([])
    const changefile = ({ file, fileList }: { file: { status: string; }; fileList: { response: {
      data: {
        id: string;
      };
    }; }[]; }): void => {
      if (file.status === 'done') {
        fileids.value = fileList.map(item => item.response.data.id)
        emit('update:value', fileList.map(item => item.response.data.id))
      }
    }

    const fileremove = (file: { response: {
      data: {
        id: string;
      };
    }; }): boolean => {
      fileids.value = fileids.value.filter(item => item !== file.response.data.id)
      emit('update:value', fileids.value)
      return true
    }
    return (): JSX.Element =>
      <>
        <Upload
          action='/api/file/file'
          accept='.jpeg,.jpg,.png'
          list-type='picture-card'
          onRemove={(file: { response: {
            data: {
              id: string;
            };
          }; }) => fileremove(file)}
          onChange={(file: { file: { status: string; }; fileList: { response: {
            data: {
              id: string;
            };
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
