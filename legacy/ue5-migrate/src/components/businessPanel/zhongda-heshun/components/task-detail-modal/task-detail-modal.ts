import { createModalApp } from '@/pages/widget/modal/base-modal/create-modal-app'
import { closeModal } from '@/pages/widget/modal/base-modal/modal-state'
import { TaskDetail } from './task-detail'
import { modalManager } from '@/pages/widget/modal/modal-manager'

interface ModalOptions {
  title?: string;
  taskData: Record<string, unknown>;
}

export class TaskDetailModal {
  private static instance: TaskDetailModal | null = null;
  public static getInstance (): TaskDetailModal {
    if (!TaskDetailModal.instance) {
      TaskDetailModal.instance = new TaskDetailModal();
    }
    return TaskDetailModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor () {}

  private async createModal (options: ModalOptions): Promise<string> {
    const modalId = 'task-detail-' + Date.now()
    const { createModal } = createModalApp({
      modelContent: TaskDetail,
      modalOptions: {
        title: options.title || '任务详情',
        taskData: options.taskData,
        onClose: () => {
          // 关闭当前弹窗并重新打开前一个弹窗
          modalManager.closeCurrentAndReopenPrevious(modalId);
        },
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

export const taskDetailModal = TaskDetailModal.getInstance();
export const openTaskDetailModal = async (options: ModalOptions): Promise<string> => {
  return taskDetailModal.open(options);
};
export const closeTaskDetailModal = async (modalId?: string): Promise<void> => {
  return taskDetailModal.close(modalId);
};
export const getCurrentTaskDetailModalId = (): string | null => {
  return taskDetailModal.getCurrentId();
};