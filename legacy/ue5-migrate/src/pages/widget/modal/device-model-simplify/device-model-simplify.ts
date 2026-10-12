import { createModalApp } from '../base-modal/create-modal-app'

interface ModalOptions {
  deviceId: string;
  title: string;
  onClose?: () => void;
}

export const openDeviceModalSimplify = async (options: ModalOptions): Promise<void> => {
  const modelContent = (await import('./device-model-simplify-component')).DeviceModelSimplifyComponent
  const { createModal } = createModalApp({
    modelContent,
    modalOptions: options,
  })
  createModal()
}
