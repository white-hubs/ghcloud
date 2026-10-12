
import { cubeVisitorManagementService } from '@/api/service'
import { getDefaultImg } from '@/utils/tool'
import { Modal, message, Image, Empty } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import '@/assets/style.less'

interface Props {
  id: string;
}

export const ReservationCodeModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const loading = ref(false)
    const codeData = ref()
    const handleOk = (): void => {
      modalVisible.value = false
      emit('enter')
    }
    const getCodeData = async (id: number): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeVisitorManagementService.getReservationCode({ id })
        codeData.value = res
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
    }
    const openModal = (id: number): void => {
      modalVisible.value = true
      getCodeData(id)
    }

    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='查看预约码'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
        >
          <div class='flex-center pd-20'>
            {
              codeData.value
                ? <Image src={codeData.value} width={300} height={300} key={codeData.value} fallback={getDefaultImg()} />
                : <Empty description='暂无图片' />
            }
          </div>
        </Modal>
      </>
  }
})
