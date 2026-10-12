import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { Project } from './components/project'
import { modalManager } from '@/pages/widget/modal/modal-manager'

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
  onClose?: () => void;
}
export class ProjectModal {
  private static instance: ProjectModal | null = null;
  public static getInstance (): ProjectModal {
    if (!ProjectModal.instance) {
      ProjectModal.instance = new ProjectModal();
    }
    return ProjectModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'project-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: Project,
      modalOptions: {
        title: options.title || '项目列表',
        data: options.data,
        onClose: () => {
          // 调用原始的onClose回调
          options?.onClose?.();
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

export const projectModal = ProjectModal.getInstance();
export const openProjectModal = async (options: ModalOptions): Promise<string> => {
  return projectModal.open(options);
};
export const closeProjectModal = async (modalId?: string): Promise<void> => {
  return projectModal.close(modalId);
};
export const getCurrentProjectModalId = (): string | null => {
  return projectModal.getCurrentId();
};
