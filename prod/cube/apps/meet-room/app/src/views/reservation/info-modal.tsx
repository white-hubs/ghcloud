import { Button, Form, FormItem, Modal } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, computed } from 'vue'
import type { AppointmentVo, BookRoomVo } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/service'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission'
import { CancelModal } from './cancel-modal'
import { useFieldRequired } from '@/hook/use-field-required'

interface Props {
  labelWidth: string;
}
export const InfoModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '130px'
    },
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const info = reactive<BookRoomVo>({})
    const permission = appFunctionCodes.meetroomReservation
    const isAdmin = computed(() => {
      return hasPermission(permission.cancel)
    })
    
    const { checkFieldHidden, loadFieldConfig } = useFieldRequired()
    loadFieldConfig()
    
    // 添加计算属性控制字段显示/隐藏
    const isConferenceTypeVisible = computed(() => !checkFieldHidden('conferenceType'))
    const isConferenceThemeVisible = computed(() => !checkFieldHidden('conferenceTheme'))
    const isGoodsNamesVisible = computed(() => !checkFieldHidden('goodsIds'))
    const isBookNumVisible = computed(() => !checkFieldHidden('bookNum'))
    const isContentVisible = computed(() => !checkFieldHidden('content'))
    const isParticipantVisible = computed(() => !checkFieldHidden('participantIds'))
    
    const handleOk = async (): Promise<void> => {
      modalVisible.value = false
      emit('enter')
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
    }
    const getBookRoomDetail = async (bookId: string): Promise<void> => {
      const res = await cubeMeetRoomService.getBookRoomInfo(bookId)
      Object.assign(info, res)
    }
    const cancelModalRef = ref<{ openModal: (record?: AppointmentVo) => void; }>()
    const cancelReserve = (): void => {
      cancelModalRef.value?.openModal(info)
    }
    const openModal = async (record?: AppointmentVo): Promise<void> => {
      modalVisible.value = true
      info.bookId = `${record?.bookId || ''}`
      getBookRoomDetail(`${record?.bookId || ''}`)
    }
    expose({
      openModal
    })
    const modalSlots = {
      'footer': (): JSX.Element => {
        return (
          <div>
            <Button onClick={cancel}>取消</Button>
            {isAdmin.value ?
              <Button type='primary' danger onClick={cancelReserve}>取消会议</Button>
              :
              <Button type='primary' onClick={handleOk}>确定</Button>
            }
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='会议室预约详情'
          onOk={handleOk}
          onCancel={cancel}
          width='600px'
          v-slots={modalSlots}
        >
          <Form model={info} label-col={{ style: { width: props.labelWidth } }}>
            {
              !isAdmin.value
                ? (
                  <>
                    <FormItem label='会议时段'>{info.timeInterval || '--'}</FormItem>
                    <FormItem label='预约人'>{info.subscribePersonName || '--'}</FormItem>
                    <FormItem label='部门'>{info?.organization?.name || '--'}</FormItem>
                  </>
                )
                : (
                  <>
                    <FormItem label='预约人'>{info.subscribePersonName || '--'}</FormItem>
                    <FormItem label='预约部门'>{info?.organization?.name || '--'}</FormItem>
                    <FormItem label='预约会议室'>{info.conferenceName || '--'}</FormItem>
                    <FormItem label='预约时间段'>{info.timeInterval || '--'}</FormItem>
                    
                    {isConferenceTypeVisible.value && (
                      <FormItem label='会议类型'>{info.conferenceType || '--'}</FormItem>
                    )}
                    
                    {isConferenceThemeVisible.value && (
                      <FormItem label='会议主题'>{info.conferenceTheme || '--'}</FormItem>
                    )}
                    
                    {isBookNumVisible.value && (
                      <FormItem label='参会人数'>{info.bookNum || '--'}</FormItem>
                    )}
                    
                    {isGoodsNamesVisible.value && (
                      <FormItem label='会议物品登记'>{info.goodsNames || '--'}</FormItem>
                    )}
                    
                    {isContentVisible.value && (
                      <FormItem label='会议内容'>{info.content || '--'}</FormItem>
                    )}
                    
                    {isParticipantVisible.value && (
                      <FormItem label='参会人员通知'>{info.participantList?.map(e => e.name).join(',') || '--'}</FormItem>
                    )}
                  </>
                )
            }

          </Form>
        </Modal>
        <CancelModal ref={cancelModalRef} onEnter={() => {
          cancel()
        }} labelWidth='100px' />
      </>
  }
})
