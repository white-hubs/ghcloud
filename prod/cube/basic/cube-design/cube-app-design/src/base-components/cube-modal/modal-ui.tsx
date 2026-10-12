import { defineComponent } from 'vue'
import { Modal } from '@ghcloud/cube-ui'
import type { ModalApi } from './modal-api'
export const createModalComponent = (modalApi: ModalApi): typeof CubeModal => {
  const CubeModal = defineComponent({
    setup: (props, { slots }) => {
      return (): JSX.Element => (
        <Modal destroyOnClose={modalApi.state.destroyOnClose} maskClosable={false} width={modalApi.state.width ?? '600px'} wrapClassName={modalApi.state.wrapperClass} title={modalApi.state.title} onOk={() => {
          modalApi.confirm()
        }} v-model:visible={modalApi.state.isOpen} confirmLoading={modalApi.state.confirmLoading} onCancel={() => {
          modalApi.close()
        }} v-slots={slots} />
      )
    }
  })
  return CubeModal
}
