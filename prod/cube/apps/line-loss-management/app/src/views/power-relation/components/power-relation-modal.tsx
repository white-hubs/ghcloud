import { defineComponent, reactive, ref, computed } from 'vue'
import { Modal, Form, FormItem, Input, Select, Button, message, Textarea } from '@ghcloud/cube-ui'
import { AreaCascaderSelect } from '@ghcloud/cube-app-design'
import { DeviceModalTable } from "@ghcloud/generic-component";

export const PowerRelationModal = defineComponent({
  name: 'PowerRelationModal',
  emits: ["enter", "cancel"],
  setup(props, { expose, emit }) {
    const visible = ref(false)
    const title = ref('')
    const loading = ref(false)
    const formRef = ref()
    
    const formState = reactive({
        id: '',
        name: '',
        parentIds: [] as string[],
        type: undefined as string | undefined,
        location: undefined as any,
        remark: '',
        deviceIds: [] as string[]
    })
    const formRules = computed(() => {
      return {
        name: [{ required: true, message: '请输入节点名称' }],
        location: [{ required: true, message: '请选择所在位置' }],
      }
    })
    const deviceModalTableRef = ref<{ openModal: () => void }>();
    const deviceList = ref<{ deviceId: string; deviceName: string }[]>([]);
    

    const nodeTypeOptions = [
        { label: '根节点', value: '根节点' },
        { label: '高压进线柜', value: '高压进线柜' },
        { label: '母线', value: '母线' },
        { label: '联络柜', value: '联络柜' },
        { label: '高压出线柜', value: '高压出线柜' },
        { label: '电缆', value: '电缆' }
    ]
    const parentOptions = ref([
        { label: '园区总进线', value: '1' },
        { label: '高压配电', value: '2' },
        { label: '10kV进线柜1#', value: '1-1' },
        { label: '10kV母线 I 段', value: '1-1-1' },
    ])
    const resetModal = () => {
      formRef.value?.resetFields()
      formState.id = ''
      formState.name = ''
      formState.parentIds = []
      formState.type = undefined
      formState.location = undefined
      formState.remark = ''
      formState.deviceIds = []
    }
    const getDetail = async (id: string): Promise<void> => {
      try {
        // const res = await cubeLineLossManagementService.getRelationDetail(id)
        // Object.assign(formState, res);
    } catch {
      }
    }

    const open = (type: 'add' | 'edit', record?: any, parentNode?: any) => {
        visible.value = true
        title.value = type === 'add' ? '新增下级' : '供电关系-编辑'
        resetModal()
        if (type === 'add' && parentNode) {
            formState.parentIds = [parentNode.key || parentNode.id]
        } else if (type === 'edit' && record) {
            // getDetail(record.id)
            Object.assign(formState, record);
        }
    }

    const handleOk = async () => {
        try {
            await formRef.value?.validate()
            loading.value = true
            const params = {
            }
            // await cubeLineLossManagementService.saveRelation(params)
            // message.success("操作成功")
            // emit("enter")
        } catch {
        } finally {
          setTimeout(() => {
              loading.value = false
              visible.value = false
          }, 500)
        }
    }

    const handleCancel = () => {
        visible.value = false
        emit("cancel")
    }

    expose({ open })

    return () => (
        <>
        <Modal
            v-model:visible={visible.value}
            title={title.value}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading.value}
            width={700}
        >
           <Form model={formState} ref={formRef} rules={formRules.value} labelCol={{ style: { width: '100px' } }}>
               <FormItem label="节点名称" name="name">
                   <Input v-model:value={formState.name} placeholder="请输入节点名称" />
               </FormItem>
               <FormItem label="父级节点" name="parentIds">
                    <Select 
                        v-model:value={formState.parentIds} 
                        mode="multiple" 
                        options={parentOptions.value} 
                        placeholder="请选择父级节点"
                        allowClear
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                    />
               </FormItem>
               <FormItem label="节点类型" name="type">
                   <Select 
                        v-model:value={formState.type} 
                        options={nodeTypeOptions} 
                        placeholder="请选择节点类型"
                        allowClear
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                    />
               </FormItem>
               <FormItem label="所在位置" name="location">
                   <AreaCascaderSelect 
                        v-model:value={formState.location} 
                        placeholder="请选择所在位置" 
                    />
               </FormItem>
               <FormItem label="备注" name="remark">
                   <Textarea 
                        v-model:value={formState.remark} 
                        rows={4} 
                        placeholder="请输入备注" 
                    />
               </FormItem>
               <FormItem label="设备绑定" name="deviceIds">
                   <div style={{ display: "flex", alignItems: "center" }}>
                    <Select
                    style={{ minWidth: "360px" }}
                    open={false}
                    showArrow={false}
                    mode="multiple"
                    options={deviceList.value}
                    v-model:value={formState.deviceIds}
                    placeholder="请选择设备"
                    fieldNames={{ label: "deviceName", value: "deviceId" }}
                    getPopupContainer={(e: { parentNode: unknown }) => e.parentNode}
                    maxTagCount={2}
                    onChange={() => {
                        deviceList.value = deviceList.value.filter((i) => formState.deviceIds?.includes(i.deviceId));
                    }}
                    />
                    <Button type="primary" onClick={() => deviceModalTableRef.value?.openModal()}>
                    选择设备
                    </Button>
                </div>
               </FormItem>
           </Form>
        </Modal>
        <DeviceModalTable
          ref={deviceModalTableRef}
          searchParams={{ applicationCode: __ENV__.applicationCode }}
          v-model:value={deviceList.value}
          title="选择设备"
          onOk={(values: { deviceName: string; deviceId: string }[]) => {
            formState.deviceIds = values.map((e) => e.deviceId);
            deviceList.value = values.map((e) => ({ deviceName: e.deviceName, deviceId: e.deviceId }));
          }}
        />
        </>
    )
  }
})
