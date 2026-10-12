import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Input, Button, type FormInstance } from '@ghcloud/cube-ui'
import type { FormState } from '../guide-device-config'
import { GUpload } from '@/components/common/upload'
import { MapSelect } from '@/components/map-select/map-select'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const EditModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    state: {
      type: String,
      default: 'create'
    },
    formData: {
      type: Object as PropType<FormState>,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const state = reactive({
      mapVisible: false,
      formState: {
        name: '',
        logo: '',
        title: '',
        zoom: '',
        coordinate: '',
      }
    })
    const formRef = ref<FormInstance>()
    const uploadRef = ref<{ clearAll: () => void; }>()
    watch(() => props.formData, (val) => {
      state.formState = val
    })
    const title = computed(() => {
      return props.state === 'create' ? '新增设备' : '编辑设备'
    })
    const handleOk = async (): Promise<void> => {
      await formRef.value?.validate()
      emit('save', state.formState)
    }
    const rules = {
      name: [
        {
          required: true,
          message: '请输入类型名称'
        }
      ],
      title: [
        {
          required: true,
          message: '请输入设备标题'
        }
      ],
      coordinate: [
        {
          required: true,
          message: '请选择设备位置'
        }
      ],
      zoom: [
        {
          required: true,
          message: '请设置设备位置层级'
        }
      ],
      logo: [
        {
          required: true,
          message: '请上传设备图片'
        }
      ]
    }
    return (): JSX.Element => (
      <Modal
        title={title.value}
        width={600}
        onCancel={() => {
          emit('update:visible')
        }}
        onOk={handleOk}
        v-model:visible={props.visible}
      >
        <Form
          labelCol={{
            style: {
              width: '90px'
            }
          }}
          rules={rules} ref={formRef} model={state.formState}
        >
          <FormItem label='设备名称' name='name'>
            <Input v-model:value={state.formState.name} />
          </FormItem>
          <FormItem label='设备标题' name='title'>
            <Input v-model:value={state.formState.title} />
          </FormItem>
          <FormItem label='设备坐标' name='coordinate'>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Input v-model:value={state.formState.coordinate} />
              <Button type='primary' onClick={() => {
                state.mapVisible = true
              }}>选择坐标</Button>
            </div>

          </FormItem>
          <FormItem label='点位层级' name='zoom'>
            <Input v-model:value={state.formState.zoom} />
          </FormItem>
          <FormItem label='logo' name='logo'>
            <GUpload sceneCode={GLOBAL_SCENE_CODE.electronicGuide} v-model:value={state.formState.logo} ref={uploadRef} max={1} />
          </FormItem>
          <MapSelect
            v-model:visible={state.mapVisible}
            selectType='point'
            value={{
              point: state.formState.coordinate
            }}
            onOk={(value: { point: string; }) => {
              state.formState.coordinate = value.point
              state.mapVisible = false
            }}
          />
        </Form>
      </Modal>
    )
  }
})
