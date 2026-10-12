import { Form, FormItem, Input, type FormInstance, Button, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { addModel } from '@/api/model'
type EntryType = 'views' | 'views-2d' | 'views-three' | 'views-old-area' | 'views-2d-old-area'
export default defineComponent({
  name: 'import-model',
  props: {
    modelType: {
      type: String as PropType<EntryType>,
      default: 'views'
    },
    operateType: {
      type: String,
      default: 'add'
    },
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  setup (props) {
    const formData = reactive<{ name: string; modelUrl: string; }>({ name: '', modelUrl: '' })
    const formRef = ref<FormInstance>()
    const modelConfigData = ref<ModelConfigItf>()
    const saveModel = async (): Promise<void> => {
      if (modelConfigData.value?.ue5) {
        modelConfigData.value.title = formData.name
        if (props.operateType === 'edit') {
          // 修改
          if (props.modelType === 'views' || props.modelType === 'views-old-area') {
            modelConfigData.value.ue5.modelServer[0] = { name: formData.name, url: formData.modelUrl }
          }
          modelConfigData.value.entry = props.modelType
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
        } else {
          // 新增
          if (props.modelType === 'views' || props.modelType === 'views-old-area')modelConfigData.value.ue5.modelServer.push({ name: formData.name, url: formData.modelUrl })
          modelConfigData.value.entry = props.modelType
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
        }
        message.success('保存成功')
      }
    }
    watch(() => props.data, () => {
      formData.name = props.data.title
      if (props.data.ue5?.modelServer)formData.modelUrl = props.data.ue5.modelServer[0]?.url ?? ''
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <div style={{ width: '800px' }}>
        <Form model={formData} ref={formRef} label-col={{ style: { width: '100px' } }}>
          <FormItem label='标题'>
            <Input
              maxlength={50}
              placeholder='请输入标题名称'
              v-model:value={formData.name}
            />
          </FormItem>
          <FormItem label='模型地址' v-show={props.modelType === 'views' || props.modelType === 'views-old-area'}>
            <Input
              placeholder='请输入模型地址'
              maxlength={200}
              showCount={false}
              v-model:value={formData.modelUrl}
            />
          </FormItem>
        </Form>
        <Button type='primary' style={{ marginLeft: '100px' }} onClick={saveModel}>保存</Button>
      </div>
  }
})
