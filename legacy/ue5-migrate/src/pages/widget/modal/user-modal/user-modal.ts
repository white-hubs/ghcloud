import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { createModalApp } from '../base-modal/create-modal-app'

interface ModalOptions {
  userInfo: UserInfo;
  onClose?: () => void;
}
export const openUserInfoModal = async (options: ModalOptions): Promise<void> => {
  const modelContent = (await import('./user-modal-component')).UserModalComponent
  const { createModal } = createModalApp({
    modelContent,
    modalOptions: options,
  })
  createModal()
}
