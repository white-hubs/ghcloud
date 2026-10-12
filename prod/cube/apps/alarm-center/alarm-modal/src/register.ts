import { CubeMessageEvent } from "@ghcloud/cube-protocol";

interface RegisterOptions {
  entry?: string;
  /** 为 false 时不展示详情按钮（如指挥调度场景） */
  showDetailButton?: boolean;
  /** 弹窗关闭后空闲多久销毁 iframe，默认 30 分钟 */
  idleDestroyMs?: number;
}

export class CubeAlarmModal {
  private containerDom: HTMLIFrameElement | null = null;
  private readonly modalOptions: RegisterOptions | null = null;
  private handleClickDetailCallBack: ((data: unknown) => void) | null = null;
  private handleLocateDevice: ((data: unknown) => void) | null = null;
  private handleCloseModal: (<T>(data: T) => void) | null = null;
  private handleModalReady: (() => void) | null = null;
  private modalReady = false;
  private readonly pendingAlarmMessages: unknown[] = [];
  private readonly messageHandler = this.message.bind(this);
  private idleDestroyTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly idleDestroyMs: number;

  /** 报警弹窗初始化 */
  public constructor(options?: RegisterOptions) {
    this.modalOptions = options ?? {};
    this.idleDestroyMs = this.modalOptions.idleDestroyMs ?? 30 * 60 * 1000;
    window.addEventListener("message", this.messageHandler);
    this.createIframe();
  }

  private createIframe(): void {
    if (this.containerDom) {
      return;
    }
    this.containerDom = document.createElement("iframe");
    this.containerDom.src = this.modalOptions?.entry ?? "/apps/@ghcloud/cube-alarm-modal/";
    this.containerDom.className = "cube-alarm-modal-container";
    this.containerDom.style.width = "100vw";
    this.containerDom.style.height = "100vh";
    this.containerDom.style.position = "fixed";
    this.containerDom.style.zIndex = "-1000";
    this.containerDom.style.display = "none";
    this.containerDom.style.top = "0";
    this.containerDom.style.left = "0";
    this.containerDom.allowFullscreen = true;
    this.containerDom.allow = "autoplay";
    document.body.append(this.containerDom);
    this.modalReady = false;
  }

  private destroyIframe(): void {
    this.clearIdleDestroyTimer();
    if (!this.containerDom) {
      return;
    }
    document.body.removeChild(this.containerDom);
    this.containerDom = null;
    this.modalReady = false;
  }

  private clearIdleDestroyTimer(): void {
    if (this.idleDestroyTimer) {
      clearTimeout(this.idleDestroyTimer);
      this.idleDestroyTimer = null;
    }
  }

  private scheduleIdleDestroy(): void {
    this.clearIdleDestroyTimer();
    this.idleDestroyTimer = setTimeout(() => {
      this.destroyIframe();
    }, this.idleDestroyMs);
  }

  private ensureIframe(): void {
    if (!this.containerDom) {
      this.createIframe();
    }
  }

  /** 报警弹窗卸载 */
  public removeAlarmModal(): void {
    this.clearIdleDestroyTimer();
    this.destroyIframe();
    window.removeEventListener("message", this.messageHandler);
  }

  /** 报警消息处理 */
  public handelAlarmMessage(alarmMessage: unknown): void {
    this.clearIdleDestroyTimer();
    this.ensureIframe();
    if (!this.containerDom) {
      return;
    }
    if (!this.modalReady) {
      this.pendingAlarmMessages.push(alarmMessage);
      return;
    }
    this.postAlarmMessage(alarmMessage);
  }

  private postAlarmMessage(alarmMessage: unknown): void {
    this.containerDom?.style.setProperty("z-index", "99999", "important");
    this.containerDom?.style.setProperty("display", "block", "important");
    this.containerDom?.style.setProperty("visibility", "visible", "important");
    this.containerDom?.style.setProperty("opacity", "1", "important");
    this.containerDom?.style.setProperty("pointer-events", "auto", "important");
    this.handleLocateDevice && this.containerDom?.contentWindow?.postMessage({ type: "showDeviceLocateButton", data: true }, "*");
    if (this.shouldPostShowDetailButton()) {
      this.containerDom?.contentWindow?.postMessage({ type: "showDetailButton", data: true }, "*");
    }
    this.containerDom?.contentWindow?.postMessage({ type: "cube-alarm-message", data: JSON.stringify(alarmMessage) }, "*");
  }

  private shouldPostShowDetailButton(): boolean {
    if (this.modalOptions?.showDetailButton === false) {
      return false;
    }
    return !!this.handleClickDetailCallBack;
  }

  private syncDetailButtonVisibility(): void {
    if (this.modalOptions?.showDetailButton === false) {
      this.containerDom?.contentWindow?.postMessage({ type: "hideDetailButton" }, "*");
      return;
    }
    if (this.handleClickDetailCallBack) {
      this.containerDom?.contentWindow?.postMessage({ type: "showDetailButton", data: true }, "*");
    }
  }

  private flushPendingAlarmMessages(): void {
    const pendingMessages = [...this.pendingAlarmMessages];
    this.pendingAlarmMessages.length = 0;
    void this.flushPendingMessagesSequentially(pendingMessages);
  }

  private async flushPendingMessagesSequentially(messages: unknown[]): Promise<void> {
    for (const alarmMessage of messages) {
      this.postAlarmMessage(alarmMessage);
      await this.waitForModalCompleted();
    }
  }

  private waitForModalCompleted(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (event: MessageEvent): void => {
        if (event.data?.type === "cube-alarm-modal-completed") {
          window.removeEventListener("message", handler);
          resolve();
        }
      };
      window.addEventListener("message", handler);
      setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve();
      }, 30_000);
    });
  }

  /** 设置点击事件回调 */
  public onClickDetail(callBack: (data: unknown) => void): void {
    this.handleClickDetailCallBack = callBack;
    if (this.modalReady) {
      this.syncDetailButtonVisibility();
    }
  }

  /** 设置关闭事件回调 */
  public onClose(callBack: () => void): void {
    this.handleCloseModal = callBack;
  }

  public onDeviceLocate(callBack: (data: unknown) => void): void {
    this.handleLocateDevice = callBack;
  }

  public onModalReady(callBack: () => void): void {
    this.handleModalReady = callBack;
  }

  public message(event: { data: { type: string; data: string } }): void {
    const msgType = event.data.type;
    if (msgType === "cube-alarm-modal-ready") {
      this.modalReady = true;
      this.handleModalReady?.();
      this.syncDetailButtonVisibility();
      this.flushPendingAlarmMessages();
      return;
    }
    if (!this.containerDom) {
      return;
    }
    if (msgType === "cube-alarm-modal-close") {
      this.containerDom.style.setProperty("z-index", "-1000", "important");
      this.containerDom.style.setProperty("display", "none", "important");
      this.handleCloseModal && this.handleCloseModal(event.data);
      this.scheduleIdleDestroy();
    }
    if (msgType === "cube-alarm-modal-click-detail") {
      this.handleClickDetailCallBack && this.handleClickDetailCallBack(JSON.parse(event.data.data));
    }
    if (msgType === CubeMessageEvent.CUBE_ALARM_MODAL_DEVICE_LOCATE) {
      this.handleLocateDevice && this.handleLocateDevice(JSON.parse(event.data.data));
    }
  }

  public close(): void {
    this.containerDom && this.containerDom.contentWindow?.postMessage({ type: "close-modal" }, "*");
  }
}
