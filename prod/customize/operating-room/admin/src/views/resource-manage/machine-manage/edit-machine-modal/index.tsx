import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Form, FormItem, Modal, Input, Textarea, type FormInstance } from '@ghcloud/cube-ui'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { FileUpload, type OSSFile } from '@/components/business/file-upload/file-upload'
import type { ResourceMachinesRecord } from '@ghcloud/cube-operating-room-service'
export const EditMachineModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    info: {
      type: Boolean,
      default: () => false
    },
    formState: {
      type: Object as PropType<ResourceMachinesRecord>,
      default: () => {}
    }
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const state = reactive<{
      formState: ResourceMachinesRecord;
      files: OSSFile[];
    }>({
      formState: {
        id: '',
        tenant: '',
        arguments: '',
        code: '',
        fileIds: '',
        roomIds: '',
        createTime: 0,
        fileList: [],
        roomNumber: 0
      },
      files: []
    })
    const rules = {
      tenant: [{
        required: true,
        message: '请选择医院'
      }],
      code: [{
        required: true,
        message: '请输入机组编号'
      }],
    }
    const handleOk = async (): Promise<void> => {
      if (!props.info) {

        await formRef.value?.validate()
        emit('ok', {
          tenant: state.formState.tenant,
          id: state.formState.id,
          arguments: state.formState.arguments,
          code: state.formState.code,
          files: state.files
        })
      }
    }
    const title = computed(() => {
      if (props.info) return '机组详情'
      return state.formState.id ? '编辑机组' : '新增机组'
    })
    const formRef = ref<FormInstance>()
    watch(() => props.formState, () => {
      state.formState = {
        ...props.formState,
        tenant: props.formState.tenant ? props.formState.tenant : state.formState.tenant,
      }
      state.files = props.formState.fileList as unknown as OSSFile[]
    })
    return (): JSX.Element => (
      <Modal
        v-model:visible={props.visible} title={title.value} onOk={handleOk} onCancel={() => {
          emit('update:visible', false)
        }}
      >
        <Form
          model={state.formState}
          rules={rules}
          ref={formRef}
          style={{ margin: '0' }} labelCol={{
            style: {
              width: '100px'
            }
          }}
        >
          <FormItem label='选择医院' name='tenant'>
            <TenantSelect disabled={props.info} v-model:value={state.formState.tenant} style={{ width: '180px' }} />
          </FormItem>
          <FormItem label='机组编号' name='code'>
            <Input disabled={props.info} v-model:value={state.formState.code} />
          </FormItem>
          <FormItem label='机组铭牌参数'>
            <Textarea
              disabled={props.info}
              v-model:value={state.formState.arguments} autoSize={{
                minRows: 4,
                maxRows: 10
              }}
            />
          </FormItem>
          <FormItem label='机组铭牌附件'>
            <FileUpload readonly={props.info} v-model:value={state.files} type='picture-card' typelist={['image/jpeg', 'image/png', 'image/jpg']} customText='请上传不超过10M的JPG、PNG、JEPG文件,最多可上传10张' maxCount={10} multiple />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
