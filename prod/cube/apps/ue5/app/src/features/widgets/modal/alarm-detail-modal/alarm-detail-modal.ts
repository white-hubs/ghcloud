import { createModalApp } from "../base-modal/create-modal-app";

interface ModalOptions {
  title: string;
  alarmData: Record<string, unknown>;
}

export const openAlarmDetailModal = async (options: ModalOptions): Promise<void> => {
  const modelContent = (await import("./alarm-detail-component")).AlarmDetailComponent;
  const { createModal } = createModalApp({
    modelContent,
    modalOptions: options,
  });
  createModal();
};
