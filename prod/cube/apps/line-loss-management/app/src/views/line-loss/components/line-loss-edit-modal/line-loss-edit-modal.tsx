import { defineComponent, reactive, ref } from 'vue'
import { Modal, Form, FormItem, Input, Textarea, Row, Col } from '@ghcloud/cube-ui'

export const LineLossEditModal = defineComponent({
  name: 'LineLossEditModal',
  emits: ["ok"],
  setup(props, { expose, emit }) {
    const visible = ref(false)
    const loading = ref(false)
    const formRef = ref()
    
    const formState = reactive({
      lineName: '',
      location: '',
      lineType: '',
      lineLength: '',
      lineModel: '',
      installMethod: '',
      remark: '',
    })

    const open = (record: any) => {
        visible.value = true
        Object.assign(formState, record)
    }

    const handleOk = async () => {
        try {
            await formRef.value?.validate()
            loading.value = true
            // Simulate API call
            setTimeout(() => {
                loading.value = false
                visible.value = false
                emit('ok', { ...formState })
            }, 500)
        } catch (e) {
            loading.value = false
        }
    }

    const handleCancel = () => {
        visible.value = false
    }

    expose({ open })

    return () => (
        <Modal
            v-model:visible={visible.value}
            title="编辑"
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading.value}
            width={800}
        >
           <Form model={formState} ref={formRef} labelCol={{ style: { width: '100px' } }}>
               <Row gutter={24}>
                   <Col span={12}>
                       <FormItem label="线路" name="lineName" required>
                           <span style={{ color: '#1890ff' }}>{formState.lineName}</span>
                       </FormItem>
                   </Col>
                   <Col span={12}>
                       <FormItem label="所在位置" name="location" required>
                           <span>{formState.location}</span>
                       </FormItem>
                   </Col>
               </Row>
               <Row gutter={24}>
                   <Col span={12}>
                       <FormItem label="线路类型" name="lineType">
                           <Input v-model:value={formState.lineType} placeholder="请输入" />
                       </FormItem>
                   </Col>
                   <Col span={12}>
                       <FormItem label="线路长度" name="lineLength">
                           <Input v-model:value={formState.lineLength} placeholder="请输入" />
                       </FormItem>
                   </Col>
               </Row>
               <Row gutter={24}>
                   <Col span={12}>
                       <FormItem label="线路型号" name="lineModel">
                           <Input v-model:value={formState.lineModel} placeholder="请输入" />
                       </FormItem>
                   </Col>
                   <Col span={12}>
                       <FormItem label="铺设方式" name="installMethod">
                           <Input v-model:value={formState.installMethod} placeholder="请输入" />
                       </FormItem>
                   </Col>
               </Row>
               <Row gutter={24}>
                   <Col span={24}>
                       <FormItem label="备注" name="remark" >
                           <Textarea v-model:value={formState.remark} rows={4} placeholder="请输入备注" />
                       </FormItem>
                   </Col>
               </Row>
           </Form>
        </Modal>
    )
  }
})
