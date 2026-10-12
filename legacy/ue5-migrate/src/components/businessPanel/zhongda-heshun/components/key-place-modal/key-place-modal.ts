import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { KeyPlace } from './components/key-place'
import type { KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
  onClose?: () => void | Promise<void>;
  onLocate?: (data: KeyPlacePageVO) => void | Promise<void>;
}
export class KeyPlaceModal {
  private static instance: KeyPlaceModal | null = null;
  public static getInstance (): KeyPlaceModal {
    if (!KeyPlaceModal.instance) {
      KeyPlaceModal.instance = new KeyPlaceModal();
    }
    return KeyPlaceModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'key-place-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: KeyPlace,
      modalOptions: {
        title: options.title || '重点场所',
        data: options.data,
        onClose: options?.onClose,
        onLocate: (data: KeyPlacePageVO): void=>{
          options.onLocate && options.onLocate(data)
        }
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

export const keyPlaceModal = KeyPlaceModal.getInstance();
export const openKeyPlaceModal = async (options: ModalOptions): Promise<string> => {
  return keyPlaceModal.open(options);
};
export const closeKeyPlaceModal = async (modalId?: string): Promise<void> => {
  return keyPlaceModal.close(modalId);
};
export const getCurrentKeyPlaceModalId = (): string | null => {
  return keyPlaceModal.getCurrentId();
};
