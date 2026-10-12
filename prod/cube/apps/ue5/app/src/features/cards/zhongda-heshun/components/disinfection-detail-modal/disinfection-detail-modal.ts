import { DisinfectionDetail } from "./disinfection-detail";
import { createModalApp } from "@/features/widgets/modal/base-modal/create-modal-app";
import { closeModal } from "@/features/widgets/modal/base-modal/modal-state";
import { modalManager } from "@/features/widgets/modal/modal-manager";

interface ModalOptions {
  title?: string;
  disinfectionData: Record<string, unknown>;
}

export class DisinfectionDetailModal {
  private static instance: DisinfectionDetailModal | null = null;
  public static getInstance(): DisinfectionDetailModal {
    if (!DisinfectionDetailModal.instance) {
      DisinfectionDetailModal.instance = new DisinfectionDetailModal();
    }
    return DisinfectionDetailModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor() {}

  private async createModal(options: ModalOptions): Promise<string> {
    const modalId = "disinfection-detail-" + Date.now();
    const { createModal } = createModalApp({
      modelContent: DisinfectionDetail,
      modalOptions: {
        title: options.title || "消杀详情",
        disinfectionData: options.disinfectionData,
        onClose: () => {
          // 关闭当前弹窗并重新打开前一个弹窗
          modalManager.closeCurrentAndReopenPrevious(modalId);
        },
      },
      modalId,
    });
    createModal();
    return modalId;
  }

  public async open(options: ModalOptions): Promise<string> {
    if (this.currentModalId) {
      await this.close();
    }
    const modalId = await this.createModal(options);
    this.currentModalId = modalId;
    // 将当前弹窗信息压入栈中
    modalManager.pushModal({
      id: modalId,
      modalInstance: this,
      options,
    });
    return modalId;
  }

  public async close(modalId?: string): Promise<void> {
    const id = modalId || this.currentModalId;
    if (id) {
      closeModal(id);
      if (id === this.currentModalId) {
        this.currentModalId = null;
      }
    }
  }

  public getCurrentId(): string | null {
    return this.currentModalId;
  }
}

export const disinfectionDetailModal = DisinfectionDetailModal.getInstance();
export const openDisinfectionDetailModal = async (options: ModalOptions): Promise<string> => {
  return disinfectionDetailModal.open(options);
};
export const closeDisinfectionDetailModal = async (modalId?: string): Promise<void> => {
  return disinfectionDetailModal.close(modalId);
};
export const getCurrentDisinfectionDetailModalId = (): string | null => {
  return disinfectionDetailModal.getCurrentId();
};
