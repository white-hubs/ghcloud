import { createModalApp } from "../base-modal/create-modal-app";

interface ModalOptions {
  deviceId: string;
  title: string;
  activeTab?: string;
  onClose?: () => void;
}

export const openDeviceModal = async (options: ModalOptions): Promise<void> => {
  const modelContent = (await import("./device-modal-component")).DeviceModalComponent;
  const { createModal } = createModalApp({
    modelContent,
    modalOptions: options,
  });
  createModal();
};
