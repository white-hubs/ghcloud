import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, Switch, message, type FormExpose } from '@ghcloud/cube-ui'
import { CreateResultItem, useCubeModal, type InspectResultItem } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'

interface Props {
  title: string;
}
interface InspectResultInfo {
  code: string;
  enable: boolean;
  name: string;
  options: {
    errorFlag: boolean;
    itemName: string;
    itemValue: string;
    key: string;
  }[];
}
export const InspectResultModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const createResultItemRef = ref<{ checkResultList: () => Promise<unknown>; }>()
    const formState = reactive<{
      id: string | undefined;
      code: string | undefined;
      name: string | undefined;
      enable: boolean | undefined;
      options: InspectResultItem[];
    }>({
      id: undefined,
      code: '',
      name: undefined,
      enable: undefined,
      options: []
    })
    const modalRules = {
      name: [{ required: true, message: '请输入结果名称', trigger: 'blur' }],
      options: [{ required: true, validator: async () => createResultItemRef.value?.checkResultList(), trigger: 'blur' }]
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            ...formState
          }
          if (formState.id) {
            await cubeDailyInspectionService.updateInspectResult(formState.id, params)
          } else {
            await cubeDailyInspectionService.addInspectResult(params)
          }
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch {
        }finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        emit('cancel')
        modalApi.close()
      }
    })
    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyInspectionService.getInspectResultDetail(id) as InspectResultInfo
        if (res) {
          formState.code = res?.code
          formState.name = res?.name
          formState.enable = res?.enable
          formState.options = res?.options
        }
      } catch {
      }
    }
    const openModal = (record?: { id: string; }): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` })
        formState.id = record?.id
        getData(record?.id)
      } else {
        modalApi.setState({ title: `新增${props.title}` })
        formState.enable = true
      }
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: () => {
        return (
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
            <FormItem label='结果名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入结果名称' />
            </FormItem>
            <FormItem label='状态' name='enable'>
              <Switch v-model:value={formState.enable} />
            </FormItem>
            <FormItem label='结果项' name='options'>
              <CreateResultItem ref={createResultItemRef} v-model:value={formState.options} />
            </FormItem>
          </Form>
        )
      }
    }
    return () => <CubeModal v-slots={modalSlots} />
  }
})
