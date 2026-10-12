import { ModalApi } from './modal-api'
import type { ModalApiOptions } from './modal.type'
import { createModalComponent } from './modal-ui'
export const useCubeModal = (options: ModalApiOptions = {}): [typeof CubeModal, ModalApi] => {
  const modalApi = new ModalApi(options) // 数据管理实例化对象
  const CubeModal = createModalComponent(modalApi) // 组件实例
  return [
    CubeModal,
    modalApi
  ]
}
