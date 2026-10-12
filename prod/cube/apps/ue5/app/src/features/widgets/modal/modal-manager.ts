// 弹窗信息接口
interface ModalInfo {
  id: string;
  modalInstance: any;
  options: any; // 打开弹窗时的选项
}

/**
 * 弹窗管理器 - 单例模式
 * 用于管理弹窗的层级关系，实现弹窗的下钻和返回功能
 */
export class ModalManager {
  private static instance: ModalManager | null = null;
  private modalStack: ModalInfo[] = [];

  private constructor() {}

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  /**
   * 将当前弹窗压入栈中
   * @param modalInfo 弹窗信息
   */
  public pushModal(modalInfo: ModalInfo): void {
    this.modalStack.push(modalInfo);
  }

  /**
   * 从栈中弹出最上层弹窗
   * @returns 弹出的弹窗信息
   */
  public popModal(): ModalInfo | undefined {
    return this.modalStack.pop();
  }

  /**
   * 获取栈顶弹窗
   * @returns 栈顶弹窗信息
   */
  public getTopModal(): ModalInfo | undefined {
    if (this.modalStack.length === 0) {
      return undefined;
    }
    return this.modalStack[this.modalStack.length - 1];
  }

  /**
   * 关闭当前弹窗并重新打开前一个弹窗
   * @param currentModalId 当前弹窗ID
   */
  public closeCurrentAndReopenPrevious(currentModalId: string): void {
    // 确保当前弹窗ID与栈顶弹窗ID一致
    const topModal = this.getTopModal();
    if (!topModal || topModal.id !== currentModalId) {
      return;
    }

    // 弹出当前弹窗
    this.popModal();

    // 获取前一个弹窗并重新打开
    const prevModal = this.getTopModal();
    if (prevModal && prevModal.modalInstance) {
      prevModal.modalInstance.open(prevModal.options);
    }
  }

  /**
   * 清空弹窗栈
   */
  public clearStack(): void {
    this.modalStack = [];
  }
}

// 导出单例实例
export const modalManager = ModalManager.getInstance();
