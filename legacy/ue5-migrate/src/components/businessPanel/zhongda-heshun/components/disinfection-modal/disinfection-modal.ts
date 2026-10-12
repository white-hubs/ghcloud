import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { Disinfection } from './components/disinfection'
import { modalManager } from '@/pages/widget/modal/modal-manager'

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
}
export class DisinfectionModal {
  private static instance: DisinfectionModal | null = null;
  public static getInstance (): DisinfectionModal {
    if (!DisinfectionModal.instance) {
      DisinfectionModal.instance = new DisinfectionModal();
    }
    return DisinfectionModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'disinfection-modal-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: Disinfection,
      modalOptions: {
        title: options.title || '消杀记录',
        data: options.data,
      },
      modalId
    })
    createModal()
    return modalId
  }

  public async open (options: ModalOptions): Promise<string> {
    if (this.currentModalId) {
      await this.close();
    }
    const modalId = await this.createModal(options);
    this.currentModalId = modalId;

    // 将当前弹窗信息压入栈中
    modalManager.pushModal({
      id: modalId,
      modalInstance: this,
      options
    });
    return modalId;
  }

  public async close (modalId?: string): Promise<void> {
    const id = modalId || this.currentModalId;
    if (id) {
      closeModal(id);
      if (id === this.currentModalId) {
        this.currentModalId = null;
      }
    }
  }

  public getCurrentId (): string | null {
    return this.currentModalId;
  }
}

export const disinfectionModal = DisinfectionModal.getInstance();
export const openDisinfectionModal = async (options: ModalOptions): Promise<string> => {
  return disinfectionModal.open(options);
};
export const closeDisinfectionModal = async (modalId?: string): Promise<void> => {
  return disinfectionModal.close(modalId);
};
export const getCurrentDisinfectionModalId = (): string | null => {
  return disinfectionModal.getCurrentId();
};