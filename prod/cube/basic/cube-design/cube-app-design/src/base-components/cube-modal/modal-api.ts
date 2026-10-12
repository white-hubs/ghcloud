import { bindMethods } from "../../utils/index";
import type { ModalApiOptions, ModalState } from "./modal.type";
import type { UnwrapNestedRefs } from "vue";
import { reactive } from "vue";

export class ModalApi {
  public state: UnwrapNestedRefs<ModalState> = reactive({
    isOpen: false,
    destroyOnClose: true,
    confirmLoading: false,
  });

  private readonly api: Pick<ModalApiOptions, "onBeforeClose" | "onClosed" | "onConfirm" | "onOpenChange" | "onOpened">;

  public constructor(options: ModalApiOptions) {
    const { onBeforeClose, onClosed, onConfirm, onOpenChange, onOpened, ...optionsState } = options;
    this.api = {
      onBeforeClose,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
    };
    Object.assign(this.state, optionsState);
    bindMethods(this);
  }

  public setConfirmLoading(confirmLoading: boolean): void {
    this.state.confirmLoading = confirmLoading;
  }

  public setState(state: Partial<ModalState>): void {
    Object.assign(this.state, state);
  }

  public open(): void {
    this.state.isOpen = true;
  }

  /**
   * 确认操作
   */
  public confirm(): void {
    this.api.onConfirm?.();
  }

  /**
   * 关闭弹窗
   */
  public close(): void {
    const allowClose = this.api.onBeforeClose?.() ?? true;
    if (allowClose) {
      this.state.isOpen = false;
      this.api.onClosed?.();
    }
  }
}
