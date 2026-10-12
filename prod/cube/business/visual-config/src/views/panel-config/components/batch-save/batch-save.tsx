import { postAreaSceneConfig } from '@/api/mdata'
import type { ReturnAreaScenePanelConfig } from '@/api/models/mdata'
import { Button, Form, FormItem, Modal, Select, Space, type FormInstance } from '@ghcloud/cube-ui'
import { message } from 'ant-design-vue/es'
import { defineComponent, reactive, ref } from 'vue'

interface Props {
  areaId: string;
  sceneType: string;
  panelSelectRef: {
    validate: () => Promise<void>;
    getConfig: () => ReturnAreaScenePanelConfig[];
    requestAreaScenePanelConfig: () => void;
  };
}

export const BatchSave = defineComponent({
  props: ['sceneType', 'areaId', 'panelSelectRef'],
  setup (props: Props) {
    const formRef = ref<FormInstance>()
    const batchModalVisible = ref(false)
    const batchFormData = reactive<{ area: string[]; }>({ area: [] })
    const subLoading = ref(false)
    const batchSubLoading = ref(false)
    const rules = {
      area: [
        {
          required: true,
          message: '请选择区域'
        },
      ]
    }
    async function handelBatchSubmit (): Promise<void> {
      await formRef.value?.validate()
      try {
        batchSubLoading.value = true
        const tasks = batchFormData.area.map(async areaId => {
          return postAreaSceneConfig({
            areaId,
            sceneType: props.sceneType,
            panelConfigModifyParams: props.panelSelectRef?.getConfig(),
          })
        })

        await Promise.all(tasks)
        batchModalVisible.value = false
        message.success('批量配置成功')
        props.panelSelectRef.requestAreaScenePanelConfig()
      } catch {
        message.error('批量配置失败')
      } finally {
        batchSubLoading.value = false
      }
    }
    function handelBatchCancel (): void {
      batchModalVisible.value = false
      formRef.value?.resetFields()
    }
    async function showBatchModal (): Promise<void> {
      await props.panelSelectRef?.validate()
      batchSubLoading.value = false
      batchModalVisible.value = true
    }
    async function submit (): Promise<void> {
      if (!props.sceneType) {
        message.error('请选择业务菜单')
        return
      }
      try {
        subLoading.value = true
        await props.panelSelectRef?.validate()
        await postAreaSceneConfig({
          areaId: props.areaId,
          sceneType: props.sceneType,
          panelConfigModifyParams: props.panelSelectRef?.getConfig(),
        })
        message.success('配置成功')
        // props.panelSelectRef.requestAreaScenePanelConfig()
      } catch {

      } finally {
        subLoading.value = false
      }
    }
    return (): JSX.Element =>
      <>
        <Space>
          <Button type='primary' disabled={!props.sceneType} onClick={showBatchModal}>批量保存</Button>
          <Button type='primary' disabled={!props.sceneType} loading={subLoading.value} onClick={submit}>保存</Button>
        </Space>
        <Modal
          visible={batchModalVisible.value}
          title='当前配置批量保存到区域层级'
          onOk={handelBatchSubmit}
          onCancel={handelBatchCancel}
          confirmLoading={batchSubLoading.value}
        >
          <Form model={batchFormData} ref={formRef} rules={rules} label-col={{ style: { width: '120px' } }}>
            <FormItem label='适用区域层级' name='area'>
              <Select
                mode='multiple'
                v-model:value={batchFormData.area}
                options={[{ label: '一级区域', value: '1' }, { label: '二级区域', value: '2' }, { label: '三级区域', value: '3' }, { label: '四级区域', value: '4' }]}
                allowClear
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
