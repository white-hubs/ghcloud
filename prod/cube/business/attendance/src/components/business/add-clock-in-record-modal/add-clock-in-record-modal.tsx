import { clockInLogByDate, clockInRecordInsert } from '@/api/staff-clock-in'
import { logger } from '@/logger'
import { type ClockInStatus, ClockInStatusOptions } from '@/types/classes'
import { Form, FormItem, Modal, type FormExpose, DatePicker, Select } from '@ghcloud/cube-ui'
import { UserPickerInput } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, watch, type VNode } from 'vue'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'

export const AddClockInRecordModal = defineComponent({
  emits: ['success'],
  setup: (props, { expose, emit }) => {
    const modalVisible = ref(false)
    const loading = ref(false)
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      user: undefined,
      date: '',
      time: '',
      /** 异常打卡记录ID */
      id: undefined
    })
    const formRules = {
      user: [{ required: true, message: `请选择${KEYWORD_ALIAS.staff}`, trigger: 'blur' }],
      date: [{ required: true, message: '请选择打卡日期', trigger: 'blur' }],
      time: [{ required: true, message: '请选择打卡时间', trigger: 'blur' }],
      id: [{ required: true, message: '请选择异常打卡记录', trigger: 'blur' }],
    }
    const openModal = (): void => {
      formState.user = undefined
      formState.date = ''
      formState.time = ''
      formState.id = undefined
      recordSelectOptions.value = []
      modalVisible.value = true
    }
    const recordSelectOptions = ref<{ label: string; value: string; }[]>([])

    /** 确定按钮回回调 */
    const ok = async (): Promise<void> => {
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()
      try {
        loading.value = true
        const user = formState.user as unknown as { id: string; }[]
        const params = {
          id: formState.id,
          userId: user[0].id,
          actualClockInTime: formState.time,
        }
        await clockInRecordInsert(params)
        modalVisible.value = false
        emit('success')
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
    }
    const getClockRecord = async (): Promise<void> => {
      if (formState.user && formState.date) {
        try {
          const user = formState.user as { id: string; }[]
          const params = {
            clockInDate: formState.date, userId: user[0].id
          }
          const res = await clockInLogByDate(params)
          if (res.data) {
            recordSelectOptions.value = (res.data as unknown as unknown[]).map(e => {
              const item = e as { requireClockInTime: number; actualClockInTime: number; ways: 'GPS' | 'DEVEICE' | ''; id: string; clockType: string; state: ClockInStatus; }
              return {
                label: `${dayjs(item.requireClockInTime).format('HH:mm')} ${item.clockType === 'START' ? '上班' : '下班'}${ClockInStatusOptions.find(op => op.value === item.state)?.label} ${item.ways && (item.ways === 'GPS' ? '/ GPS打卡' : ' /考勤机打卡')}`,
                value: item.id
              }
            })
          }
        } catch (error) {
          logger.debug(error)
        }
      }
    }
    watch(() => formState.date, () => {
      getClockRecord()
    })
    watch(() => formState.user, () => {
      getClockRecord()
    })

    expose({
      openModal
    })

    return (): VNode=>
      <Modal visible={modalVisible.value} title='新增' width='500px' destroyOnClose onOk={ok} onCancel={cancel} loading={loading.value}>
        <Form ref={formInstance} model={formState} labelCol={{ style: { width: '100px' } }} rules={formRules}>
          <FormItem label={`${KEYWORD_ALIAS.staff}`} name='user'>
            <UserPickerInput v-model:value={formState.user} />
          </FormItem>
          <FormItem label='打卡日期' name='date'>
            <DatePicker v-model:value={formState.date} />
          </FormItem>
          <FormItem label='打卡时间' name='time'>
            <DatePicker show-time={{ format: 'HH:mm' }} format='YYYY-MM-DD HH:mm' valueFormat='YYYY-MM-DD HH:mm' v-model:value={formState.time} />
          </FormItem>
          <FormItem label='打卡班次' name='id'>
            <Select v-model:value={formState.id} options={recordSelectOptions.value} />
          </FormItem>
        </Form>
      </Modal>
  }
})
