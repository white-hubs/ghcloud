import { AntModal, DatePicker, Form, FormItem, Input, Select, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'
import { addReport, getReportDetail, updateReport } from '@/api/food-safety-report.ts'
import type { InsertState } from './index.i'
import dayjs from 'dayjs'

export const AddModal = defineComponent({
  emits: ['change'],
  setup: (props, { emit, expose }) => {
    const state = reactive<{ formState: InsertState; loading: boolean; }>({
      loading: false,
      formState: {
        stallCode: '',
        goodsCategoryName: '',
        checkResult: null,
        checkDate: '',
        sampleCode: '',
      },
    })
    const checkResultOptions = ref([
      { label: '阳性', value: 'POS' },
      { label: '阴性', value: 'NEG' },
    ])
    const modleVisible = ref<boolean>(false)
    const rowId = ref<string>()
    const handleModalOk = async (): Promise< void> => {
      if (state.formState.checkResult === '阳性') state.formState.checkResult = 'POS'
      if (state.formState.checkResult === '阴性') state.formState.checkResult = 'NEG'
      if (modalType.value === 'add') {
        await addReport({
          ...state.formState,
        })
      } else {
        await updateReport({
          ...state.formState,
          id: rowId.value!
        })
      }
      message.success('操作成功')
      state.loading = false
      modleVisible.value = false
      emit('change', state.formState)
    }
    const handleCancel = (): void => {
      state.formState = {
        stallCode: '',
        goodsCategoryName: '',
        checkResult: null,
        checkDate: '',
        goodsFrom: '',
        checkerName: '',
        checkItem: '',
      }
      modleVisible.value = false
      emit('change', state.formState)
    }
    const modalType = ref<'add' | 'edit'>('add')
    const editTemplate = (id: string, type: 'add' | 'edit'): void => {
      modalType.value = type
      modleVisible.value = true
      rowId.value = id
      getReportInfo()
    }
    const addTemplate = (): void => {
      modleVisible.value = true
      state.formState = {
        stallCode: '',
        goodsCategoryName: '',
        checkResult: null,
        checkDate: '',
        goodsFrom: '',
        checkerName: '',
        checkItem: '',
        sampleCode: '',
      }
    }
    expose({
      handleCancel,
      editTemplate,
      addTemplate
    })
    const getReportInfo = async (): Promise<void> => {
      const { data } = await getReportDetail({ id: rowId.value! })
      if (data.checkDate) data.checkDate = dayjs(data.checkDate).format('YYYY-MM-DD')
      state.formState = data as InsertState
    }
    return () => (
      <>
        <AntModal
          v-model:visible={modleVisible.value}
          title={modalType.value === 'add' ? '新增食安报表' : '编辑食安报表'}
          width={500}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleModalOk}
          onCancel={handleCancel}
        >
          <Form labelCol={{ style: { width: '120px' } }}>
            <FormItem label='档位号:'>
              <Input v-model:value={state.formState.stallCode} />
            </FormItem>
            <FormItem label='品名:'>
              <Input v-model:value={state.formState.goodsCategoryName} />
            </FormItem>
            <FormItem label='产地:'>
              <Input v-model:value={state.formState.goodsFrom} />
            </FormItem>
            <FormItem label='检测名称:'>
              <Input v-model:value={state.formState.checkItem} maxlength={50} />
            </FormItem>
            <FormItem label='样品编号:'>
              <Input v-model:value={state.formState.sampleCode} />
            </FormItem>
            <FormItem label='检测日期:'>
              <DatePicker v-model:value={state.formState.checkDate} />
            </FormItem>
            <FormItem label='检测结果:'>
              <Select v-model:value={state.formState.checkResult} options={checkResultOptions.value} placeholder='请选择检测结果' />
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
