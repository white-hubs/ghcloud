import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Field, Button, Form, type FormInstance, showNotify, Loading } from 'vant'
import './reservation.less'
import { useRoute } from 'vue-router'
import { cubeMeetRoomService } from '@/api/server'
import type { BookRoomDetail } from '@ghcloud/cube-meet-room-service'
import { CancelReason } from '@/components/cancel-reason/cancel-reason'
import dayjs from 'dayjs'
export const ReservationDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const bookId = (route.query as { bookId: string; }).bookId
    const cancelReasonRef = ref<{ openReason: (conferenceId: number | null | undefined) => void; }>()
    const formRef = ref<FormInstance>()
    const state = reactive<{
      loading: boolean;
      detail: BookRoomDetail;
    }>({
      loading: false,
      detail: {}
    })
    const getBookRoomInfo = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMeetRoomService.getBookRoomDetail({
          bookId
        })
        state.detail = result
        state.detail.appointmentDate = result.appointmentDate ? dayjs(result.appointmentDate).format('YYYY-MM-DD') : ''
        state.detail.userNames = result.participantList ? result.participantList?.map(e => e.name).join(',') : ''
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getBookRoomInfo()
    })
    const handleCancel = async (): Promise<void> => {
      await getBookRoomInfo()
    }
    return (): JSX.Element => (
      <div class='container'>
        <div class='form'>
          <Form ref={formRef} label-width='100px'>
            {state.loading && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
            <Field
              v-model={state.detail.conferenceName}
              label='会议室'
              readonly
            />
            <Field
              v-model={state.detail.areaName}
              label='所属区域'
              readonly
            />
            <Field
              v-model={state.detail.appointmentDate}
              label='预约日期'
              readonly
            />
            <Field
              v-model={state.detail.timeInterval}
              label='预约时间'
              readonly
            />
            <Field
              v-model={state.detail.goodsNames}
              label='物品使用登记'
              readonly
            />
            <Field
              v-model={state.detail.conferenceType}
              label='会议类型'
              readonly
            />
            <Field
              v-model={state.detail.bookNum}
              label='参会人数'
              readonly
            />
            <Field
              v-model={state.detail.conferenceTheme}
              label='会议主题'
              maxlength='20'
              readonly
            />
            <Field
              label='会议内容'
              v-model={state.detail.content}
              rows='2'
              autosize
              type='textarea'
              maxlength='200'
              readonly
            />
            <Field
              label='参会人员通知'
              v-model={state.detail.userNames}
              rows='2'
              autosize
              type='textarea'
              maxlength='200'
              readonly
            />
          </Form>
        </div>
        {

          state.detail.status !== 'CANCEL_RESERVATION'
            ? (
              <div class='footer'>
                <Button block type='primary' onClick={() => {
                  cancelReasonRef.value?.openReason(state.detail.id)
                }}>取消会议</Button>
              </div>
            )
            : null
        }
        <CancelReason onOk={handleCancel} ref={cancelReasonRef} />
      </div>
    )
  }
})
