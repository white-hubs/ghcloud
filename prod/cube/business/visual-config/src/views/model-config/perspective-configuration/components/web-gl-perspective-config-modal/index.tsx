
import { defineComponent, reactive, type PropType } from 'vue'
import { Form, FormItem, Modal, RadioGroup, Radio, Input, Textarea, Tooltip, message } from '@ghcloud/cube-ui'
import styles from './index.module.less'
interface PerspectiveConfig {
  area: string;
  label: string;
  value?: string;
  camera?: string;
  isDefault?: 'default' | 'custom';
  id?: string;
  buildTagLocation?: string;
  hideActors?: unknown[];
}
export const ConfigModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    showSiblingArea: {
      type: Array as PropType<string[]>,
      default: []
    },
    config: {
      type: Object as PropType<PerspectiveConfig>,
      default: () => {
        return {
          area: '',
          isDefault: 'default',
          label: '',
          value: '',
          camera: '',
        }
      }
    },
    modelUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const state = reactive({
      formData: {
        area: props.config.area,
        isDefault: props.config.isDefault,
        label: props.config.label,
        value: props.config.value,
        camera: props.config.camera,
      },
    })
    const handelSave = (): void => {
      if (state.formData.isDefault !== 'default' && state.formData.label === '') {
        message.warn('请输入视角名称')
        return
      }
      if (!state.formData.value) {
        message.warn('请获取相机参数')
        return
      }
      state.formData.camera = state.formData.value
      emit('save', state.formData)
    }

    const handelCancel = (): void => {
      emit('update:visible', false)
    }

    const tooltipSlots = {
      title: (): string => {
        return props.config.area
      }
    }
    return (): JSX.Element => (
      <Modal
        forceRender
        visible={props.visible}
        okText='保存'
        title={props.title || ''}
        width='1000px'
        onOk={handelSave}
        onCancel={handelCancel}
      >
        <Form model={state.formData} label-col={{ style: { width: '70px' } }}>
          <FormItem label='区域' name='area' style={{ paddingRight: '10px' }}>
            <Tooltip v-slots={tooltipSlots}>
              <div style={{ width: '70px' }} class={styles['text-ellipsis']}>{props.config.area}</div>
            </Tooltip>
          </FormItem>
          <FormItem label='视角名称' style={{ paddingRight: '10px' }}>
            <RadioGroup v-model:value={state.formData.isDefault}>
              <Radio value='default'>设为默认</Radio>
              <Radio value='custom'>自定义</Radio>
            </RadioGroup>
            <Input
              disabled={state.formData.isDefault === 'default'}
              maxlength={20}
              style={{ width: '160px' }}
              placeholder='请输入'
              v-model:value={state.formData.label}
            />
          </FormItem>
          <FormItem label='视角参数'>
            <Textarea
              v-model:value={state.formData.value}
              placeholder='请获取相机参数'
              showCount={false}
              rows={2}
            />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
