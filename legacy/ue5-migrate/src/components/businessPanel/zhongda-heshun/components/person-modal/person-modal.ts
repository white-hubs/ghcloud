import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { Person } from './components/person'
import type { UserDTO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
  onClose?: () => void | Promise<void>;
  onLocate?: (data: UserDTO) => void | Promise<void>;
}
export class PersonModal {
  private static instance: PersonModal | null = null;
  public static getInstance (): PersonModal {
    if (!PersonModal.instance) {
      PersonModal.instance = new PersonModal();
    }
    return PersonModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'person-modal-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: Person,
      modalOptions: {
        title: options.title || '人员情况',
        data: options.data,
        onClose: options?.onClose,
        onLocate: (data: UserDTO): void=>{
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

export const personModal = PersonModal.getInstance();
export const openPersonModal = async (options: ModalOptions): Promise<string> => {
  return personModal.open(options);
};
export const closePersonModal = async (modalId?: string): Promise<void> => {
  return personModal.close(modalId);
};
export const getCurrentPersonModalId = (): string | null => {
  return personModal.getCurrentId();
};
