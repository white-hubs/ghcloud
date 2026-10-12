import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { Task } from './components/task'
import { modalManager } from '@/pages/widget/modal/modal-manager'

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
}
export class TaskModal {
  private static instance: TaskModal | null = null;
  public static getInstance (): TaskModal {
    if (!TaskModal.instance) {
      TaskModal.instance = new TaskModal();
    }
    return TaskModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'task-modal-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: Task,
      modalOptions: {
        title: options.title || '项目任务',
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

export const taskModal = TaskModal.getInstance();
export const openTaskModal = async (options: ModalOptions): Promise<string> => {
  return taskModal.open(options);
};
export const closeTaskModal = async (modalId?: string): Promise<void> => {
  return taskModal.close(modalId);
};
export const getCurrentTaskModalId = (): string | null => {
  return taskModal.getCurrentId();
};
