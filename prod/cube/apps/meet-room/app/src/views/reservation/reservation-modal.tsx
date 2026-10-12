import { CheckboxGroup, Form, FormItem, Input, Textarea, InputNumber, Modal, Select, message, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, watch, computed } from 'vue'
import { AppointmentReserveStatus, type BookRoomVo, type ChoiceVO } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/service'
import dayjs from 'dayjs'
import { useFieldRequired } from '@/hook/use-field-required'
import { PersonSelect, PersonType, type PersonSelectProps } from '@/components/person-select'
import styles from './index.module.less'

interface Props {
  labelWidth: string;
}
export const ReservationModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '130px'
    },
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref(false)
    const info = reactive<BookRoomVo>({})
    
    const { checkFieldRequired, checkFieldHidden, loadFieldConfig, isFieldConfigLoaded } = useFieldRequired()
    loadFieldConfig()
    
    const isConferenceTypeVisible = computed(() => !checkFieldHidden('conferenceType'))
    const isConferenceThemeVisible = computed(() => !checkFieldHidden('conferenceTheme'))
    const isGoodsIdsVisible = computed(() => !checkFieldHidden('goodsIds'))
    const isBookNumVisible = computed(() => !checkFieldHidden('bookNum'))
    const isContentVisible = computed(() => !checkFieldHidden('content'))
    const isBookPersonVisible = computed(() => !checkFieldHidden('participantIds'))
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      appointmentDate: string | undefined;
      conferenceTheme: string | undefined;
      conferenceType: string | undefined;
      fieldConcatenation: string | undefined;
      goodsIds: string | undefined;
      goodsNames: string | undefined;
      subscribePerson: number | undefined;
      content: string | undefined;
      timeInterval: string | undefined;
      bookNum: number | undefined;
      conferenceId: number | undefined;
      bookPerson: PersonSelectProps | undefined;
    }>({
      id: undefined,
      appointmentDate: undefined,
      conferenceTheme: undefined,
      conferenceType: undefined,
      fieldConcatenation: undefined,
      goodsIds: undefined,
      goodsNames: undefined,
      subscribePerson: undefined,
      content: undefined,
      timeInterval: undefined,
      bookNum: undefined,
      conferenceId: undefined,
      bookPerson: undefined,
    })
    
    const handleOk = async (): Promise<void> => {
      await formRenderRef.value?.validate()
      try {
        submitLoading.value = true
        const params: Record<string, any> = {
          conferenceId: info.conferenceId || null,
          appointmentDate: formState.appointmentDate || '',
          timeInterval: info.timeInterval?.replaceAll(' ', '') || null,
        }
        
        if (isConferenceTypeVisible.value) {
          params.conferenceType = formState.conferenceType || null
        }
        
        if (isConferenceThemeVisible.value) {
          params.conferenceTheme = formState.conferenceTheme || null
        }
        
        if (isGoodsIdsVisible.value) {
          params.goodsIds = Array.isArray(formState.goodsIds) ? formState.goodsIds.join(',') : ''
          params.goodsNames = goodsOptions.value?.filter(e => formState.goodsIds?.includes(e.value ?? '')).map(i => i.label ?? '').join(',') ?? ''
        }
        
        if (isBookNumVisible.value) {
          params.bookNum = formState.bookNum || null
        }
        
        if (isContentVisible.value) {
          params.content = formState.content || null
        }
        
        if (isBookPersonVisible.value && formState.bookPerson) {
          params.participantType = formState.bookPerson.type || null
          params.participantIds = formState.bookPerson.ids ? (Array.isArray(formState.bookPerson.ids) ? formState.bookPerson.ids : [formState.bookPerson.ids]) : []
        }
        
        params.fieldConcatenation = formState.fieldConcatenation || null
        params.subscribePerson = formState.subscribePerson || null
        
        await cubeMeetRoomService.addBookRoom(params)
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    
    const checkBookPerson = async (): Promise<void> => {
      const isCheck = checkFieldRequired('participantIds')
      if (!isCheck) {
        return Promise.resolve()
      }
      if (!formState.bookPerson || !formState.bookPerson?.ids || formState.bookPerson?.ids?.length === 0) {
        return Promise.reject(new Error('请选择参会人员通知'))
      }
      return Promise.resolve()
    }
    const createModalRules = () => ({
      conferenceType: [{ required: checkFieldRequired('conferenceType'), message: '请选择会议类型', trigger: 'blur' }],
      conferenceTheme: [{ required: checkFieldRequired('conferenceTheme'), message: '请输入会议主题', trigger: 'blur' }],
      goodsIds: [{ required: checkFieldRequired('goodsIds'), message: '请选择会议物品登记', trigger: 'blur' }],
      bookNum: [{ required: checkFieldRequired('bookNum'), message: '请输入参会人数', trigger: 'blur' }],
      content: [{ required: checkFieldRequired('content'), message: '请输入会议内容', trigger: 'blur' }],
      bookPerson: [{ required: checkFieldRequired('participantIds'), validator: checkBookPerson, message: '请选择参会人员通知', trigger: 'blur' }],
    })
    const modalRules = reactive(createModalRules())
    watch(isFieldConfigLoaded, (loaded) => {
      if (loaded) {
        Object.assign(modalRules, createModalRules())
      }
    })

    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      formRenderRef.value?.resetFields()
    }
    const typeOptions = ref<{ label: string; value: string; }[]>([])
    const getTypeOptions = async (): Promise<void> => {
      const res = await cubeMeetRoomService.getMeetTypeList()
      typeOptions.value = res?.map(e => {
        return {
          label: e.name,
          value: e.id
        }
      })
    }
    const goodsOptions = ref<{ label: string; value: string; }[]>()
    const getGoodsOptions = async (): Promise<void> => {
      const res = await cubeMeetRoomService.getMeetGoodsList({
        pageNumber: 1,
        pageSize: 1000
      })
      goodsOptions.value = res?.map(e => {
        return {
          label: e.goodsName ?? '',
          value: e.id ?? ''
        }
      })
    }
    const getBookRoomDetail = async (bookId: string): Promise<void> => {
      const res = await cubeMeetRoomService.getBookRoomInfo(bookId)
      Object.assign(info, res)
    }
    const openModal = async (date: string, record?: ChoiceVO): Promise<void> => {
      formRenderRef.value?.resetFields()
      Object.assign(info, record)
      await Promise.all([
        getTypeOptions(),
        getGoodsOptions(),
      ])
      // 使用中 已预约，查看详情
      if (record?.bookStatus && [AppointmentReserveStatus.BeingUsed, AppointmentReserveStatus.Reserved].includes(record?.bookStatus) && record?.bookId) {
        await getBookRoomDetail(`${record?.bookId || ''}`)
      }
      formState.appointmentDate = date ? dayjs(date).format('YYYY-MM-DD') : ''
      formState.bookPerson = {
        type: info?.participantType as unknown as PersonType ?? PersonType.DEPARTMENT,
        ids: info?.participantList?.map(e => `${e.id ?? ''}`) ?? []
      }
      modalVisible.value = true
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='会议室预约'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='700px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='预约会议室'>{info.conferenceName || '--'}</FormItem>
            <FormItem label='预约时间段'>{info.timeInterval || '--'}</FormItem>
            
            {isConferenceTypeVisible.value && (
              <FormItem label='会议类型' name='conferenceType'>
                <Select
                  v-model:value={formState.conferenceType}
                  options={typeOptions.value}
                  placeholder='请选择会议类型'
                  allowClear
                  showSearch
                  getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                />
              </FormItem>
            )}
            
            {isConferenceThemeVisible.value && (
              <FormItem label='会议主题' name='conferenceTheme'>
                <Input v-model:value={formState.conferenceTheme} maxlength={100} placeholder='请输入会议主题' />
              </FormItem>
            )}
            
            {isGoodsIdsVisible.value && (
              <FormItem label='会议物品登记' name='goodsIds'>
                <CheckboxGroup
                  class={styles['goods-checkbox-wrapper']}
                  v-model:value={formState.goodsIds}
                  options={goodsOptions.value}
                  />
              </FormItem>
            )}
            
            {isBookNumVisible.value && (
              <FormItem label='参会人数' name='bookNum'>
                <InputNumber v-model:value={formState.bookNum} min={1} max={999} placeholder='请输入可容纳人数（支持1-999）' />
              </FormItem>
            )}
            
            {isContentVisible.value && (
              <FormItem label='会议内容' name='content'>
                <Textarea v-model:value={formState.content} placeholder='请输入会议内容' maxlength={200} rows={2} allowClear showCount />
              </FormItem>
            )}
            
            {isBookPersonVisible.value && (
              <FormItem label='参会人员通知' name='bookPerson'>
                <PersonSelect v-model:value={formState.bookPerson} />
              </FormItem>
            )}
          </Form>
        </Modal>
      </>
  }
})
