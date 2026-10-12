import type { KeyPlacePageVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { ProjectDetail } from "./components/project-detail";
import { createModalApp } from "@/features/widgets/modal/base-modal/create-modal-app";
import { closeModal } from "@/features/widgets/modal/base-modal/modal-state";
import { modalManager } from "@/features/widgets/modal/modal-manager";

interface ModalOptions {
  title?: string;
  data: Record<string, unknown>;
  onClose?: () => void | Promise<void>;
  onLocate?: (data: KeyPlacePageVO) => void | Promise<void>;
}
export class ProjectDetailModal {
  private static instance: ProjectDetailModal | null = null;
  public static getInstance(): ProjectDetailModal {
    if (!ProjectDetailModal.instance) {
      ProjectDetailModal.instance = new ProjectDetailModal();
    }
    return ProjectDetailModal.instance;
  }
  private currentModalId: string | null = null;
  private constructor() {}

  private async createModal(options: ModalOptions): Promise<string> {
    const modalId = "project-detail-" + Date.now();
    const { createModal } = createModalApp({
      modelContent: ProjectDetail,
      modalOptions: {
        title: options.title || "项目详情",
        data: options.data,
        onClose: () => {
          // 调用原始的onClose回调
          options?.onClose?.();

          // 关闭当前弹窗并重新打开前一个弹窗
          modalManager.closeCurrentAndReopenPrevious(modalId);
        },
        onLocate: (data: KeyPlacePageVO): void => {
          options.onLocate && options.onLocate(data);
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

export const projectDetailModal = ProjectDetailModal.getInstance();
export const openProjectDetailModal = async (options: ModalOptions): Promise<string> => {
  return projectDetailModal.open(options);
};
export const closeProjectDetailModal = async (modalId?: string): Promise<void> => {
  return projectDetailModal.close(modalId);
};
export const getCurrentProjectDetailModalId = (): string | null => {
  return projectDetailModal.getCurrentId();
};
