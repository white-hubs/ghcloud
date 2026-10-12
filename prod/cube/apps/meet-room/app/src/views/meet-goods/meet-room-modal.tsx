import { Cascader, Form, FormItem, Input, Modal, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, computed } from 'vue'
import type { ConferenceGoods } from '@ghcloud/cube-meet-room-service'
import { cubeMdataService, cubeMeetRoomService } from '@/api/service'
import type { AreaTree } from '@ghcloud/cube-ouaa-service'

interface Props {
  labelWidth: string;
  title: string;
}
type ActionType = 'add' | 'edit'
export const MeetGoodsModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    title: {
      type: String,
      default: '会议物品'
    },
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const action = ref<ActionType>('add')
    const submitLoading = ref(false)
    const modalVisible = ref(false)

    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      goodsName: string | undefined;
      areaId: string | undefined;
      areaName: string | undefined;
      illustrate: string | undefined;
    }>({
      id: undefined,
      goodsName: undefined,
      areaId: undefined,
      areaName: undefined,
      illustrate: undefined,
    })
    const modalRules = {
      goodsName: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
      areaName: [{ required: true, message: '请选择所属区域', trigger: 'blur' }],
    }
    const handleOk = async (): Promise<void> => {
      await formRenderRef.value?.validate()
      try {
        submitLoading.value = true
        const params = {
          areaName: formState.areaName || null,
          areaId: formState.areaId || null,
          goodsName: formState.goodsName || null,
          illustrate: formState.illustrate || null,
        }
        if (action.value === 'add') {
          await cubeMeetRoomService.addMeetGoods(params)
        }
        if (action.value === 'edit') {
          await cubeMeetRoomService.updateMeetGoods(`${formState.id}`, params)
        }
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      formRenderRef.value?.resetFields()
    }
    const areaOptions = ref()
    const getAreaOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      areaOptions.value = res
    }
    const handleAreaChange = (value: string[], selectedOptions: AreaTree[]): void => {
      formState.areaId = selectedOptions[selectedOptions.length - 1]?.id
      formState.areaName = value.join('/')
    }
    const openModal = async (record?: ConferenceGoods): Promise<void> => {
      action.value = 'add'
      formRenderRef.value?.resetFields()
      await Promise.all([
        getAreaOptions(),
      ])
      if (record?.id) {
        action.value = 'edit'
        Object.assign(formState, record)
      } else {
        for (const key in formState) {
          (formState as Record<string, unknown>)[key] = undefined
        }
      }
      modalVisible.value = true
    }
    expose({
      openModal
    })
    const title = computed(() => {
      const res = action.value === 'add' ? `新增${props.title}` : action.value === 'edit' ? `编辑${props.title}` : `${props.title}`
      return res
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title={title.value}
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='600px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='物品名称' name='goodsName'>
              <Input v-model:value={formState.goodsName} placeholder='请输入物品名称' />
            </FormItem>
            <FormItem label='所属区域' name='areaName'>
              <Cascader v-model:value={formState.areaName} onChange={handleAreaChange} options={areaOptions.value} changeOnSelect fieldNames={{ label: 'name', value: 'name', children: 'children' }} placeholder='请选择所属区域' style={{ minWidth: '160px' }} />
            </FormItem>
            <FormItem label='说明' name='illustrate'>
              <Textarea v-model:value={formState.illustrate} maxlength={200} row={2} placeholder='请输入说明' />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
