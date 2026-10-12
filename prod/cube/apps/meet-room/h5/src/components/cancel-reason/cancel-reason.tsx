import { defineComponent, onMounted, reactive, computed } from 'vue'
import { Dialog, Field, showNotify } from 'vant'
import { cubeMeetRoomService } from '@/api/server'
import type { FieldConfigurationVO } from '@ghcloud/cube-meet-room-service'
import { useFieldRequired } from '@/hooks/use-field-required'

export const CancelReason = defineComponent({
  emits: ['ok', 'cancel'],
  props: {
    date: {
      type: String,
      default: ''
    },
    conferenceId: {
      type: Number,
      default: 0
    }
  },
  setup (props, { expose, emit }) {
    const { loadFieldConfig, checkFieldRequired, checkFieldHidden } = useFieldRequired()
    
    const state = reactive<{
      showReason: boolean;
      cancelReason?: string | null;
      requiredField: FieldConfigurationVO[] | null;
      conferenceId?: number | undefined;
    }>({
      showReason: false,
      cancelReason: null,
      requiredField: [],
      conferenceId: undefined
    })
    
    const isCancelReasonVisible = computed(() => !checkFieldHidden('cancelReason'))
    
    const cancelReservation = async (): Promise<void> => {
      try {
        if (state.conferenceId === undefined) return
        
        const params: { cancelReason?: string; isCancel: boolean } = {
          isCancel: true
        }
        
        if (isCancelReasonVisible.value) {
          params.cancelReason = state.cancelReason ?? ''
        }
        
        await cubeMeetRoomService.reserveBookRoomCancel(state.conferenceId, params)
        showNotify({ type: 'success', message: '取消成功' })
        state.showReason = false
        emit('ok')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        state.showReason = false
        emit('cancel')
      }
    }
    
    const handleCancel = (): void => {
      state.showReason = false
      emit('cancel')
    }
    
    const openReason = (conferenceId?: number | undefined): void => {
      state.showReason = true
      state.cancelReason = null
      state.conferenceId = conferenceId
    }
    
    expose({
      openReason
    })
    
    onMounted(() => {
      loadFieldConfig()
    })
    
    return (): JSX.Element =>
      <Dialog v-model:show={state.showReason} title="会议取消原因" show-cancel-button onConfirm={cancelReservation} onCancel={handleCancel}>
        {isCancelReasonVisible.value && (
          <Field
            v-model={state.cancelReason}
            rows='4'
            autosize
            placeholder='请输入会议取消原因'
            type='textarea'
            maxlength='200'
            rules={[{ required: checkFieldRequired('cancelReason'), message: '请输入会议取消原因' }]}
            required={checkFieldRequired('cancelReason')}
          />
        )}
      </Dialog>
  }
})
