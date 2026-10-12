
import { addModel, getModelConfig } from '@/api/model'
import { GLayout } from '@/components/common/layout'
import { Button, Form, FormItem, Input, Select, message, type FormInstance } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'

export const RenderSettings = defineComponent({
  setup: () => {
    const formData = reactive<{ name: string; modelUrl: string; }>({ name: '', modelUrl: '' })
    const formRef = ref<FormInstance>()
    const typeOption = [
      { value: 'views', label: 'UE5' },
      { value: 'views-2d', label: '二维组态' },
      // { value: 'views-three', label: 'WEBGL-ThreeJS' },
      { value: 'views-gis', label: 'WebGIS' },
      { value: 'views-3d', label: 'WebGPU' }
    ]
    const modelConfigObj = ref<ModelConfigItf>(modelConfigInit())
    const saveModel = async (): Promise<void> => {
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
      message.success('保存成功')
    }
    const getModelConfigEvent = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfig = JSON.parse(res.modelConfiguration)
        if (Object.keys(modelConfig).length > 0) {
          modelConfigObj.value = modelConfig
          modelConfigObj.value.three = modelConfigObj.value.three ?? modelConfigObj.value.ue5
        }
      }
    }
    onMounted(async () => {
      getModelConfigEvent()
    })
    const gLayoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <div style={{ width: '800px', marginTop: '20px' }}>
            <Form />
            <Form model={formData} ref={formRef} label-col={{ style: { width: '100px' } }}>
              <FormItem label='标题'>
                <Input
                  maxlength={50}
                  placeholder='请输入标题名称'
                  v-model:value={modelConfigObj.value.title}
                />
              </FormItem>
              <FormItem label='渲染模型'>
                <Select
                  v-model:value={modelConfigObj.value.entry}
                  options={typeOption}
                  allow-clear placeholder='请选择模型'
                />
              </FormItem>
            </Form>
            <Button type='primary' style={{ marginLeft: '100px' }} onClick={saveModel}>保存</Button>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <GLayout title='渲染设置' showFooter v-slots={gLayoutSlots} />
  }
})
