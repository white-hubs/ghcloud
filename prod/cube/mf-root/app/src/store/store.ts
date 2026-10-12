import type { CubeAlarmModal } from "@ghcloud/cube-alarm-modal/src/register";
import { CubeAuthService } from "@ghcloud/cube-auth-service";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import type { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { useMfRootStore } from "./core/core";
import { privateEventMap } from "./core/event";
import { initAuthorization } from "./core/modules/auth";
import { initCommunication } from "./core/modules/communication";
import { initMessageSocket, messageRead } from "./core/modules/message-socket";
import { initUserInfo } from "./core/modules/user-info";

interface MfRootGlobalStateOptions {
  terminal: CubeTerminalEnum;
  messageSocketSubscribeType?: "broadcast";
}

export class CubeMfRootGlobalState {
  private static instance: CubeMfRootGlobalState;
  public static getInstance(options?: MfRootGlobalStateOptions): CubeMfRootGlobalState {
    if (!this.instance && !options) {
      throw new Error("MfRootGlobalState is not initialized");
    }
    if (!this.instance && options) {
      this.instance = new CubeMfRootGlobalState(options);
    }
    return this.instance;
  }

  public readonly mfRootState;
  private handleError: ((errorMsg: string) => void) | undefined = undefined;
  private handleReload: (() => void) | undefined = undefined;
  private handleLogout: (() => void) | undefined = undefined;
  private handleTerminalMessage: ((message: unknown) => void) | undefined = undefined;
  private handleRtcCallEnd: (() => void) | undefined = undefined;
  private handleRtcReceived: ((userInfo: UserInfo) => void) | undefined = undefined;
  private handleAlarmModalReady: ((instance: CubeAlarmModal) => void) | undefined = undefined;
  private handleAlarmNotice: ((alarmMessage: unknown) => void) | undefined = undefined;
  private terminal: CubeTerminalEnum;
  private messageSocketSubscribeType: string | undefined;

  private constructor({ terminal, messageSocketSubscribeType }: MfRootGlobalStateOptions) {
    this.mfRootState = useMfRootStore();
    this.terminal = terminal;
    this.messageSocketSubscribeType = messageSocketSubscribeType;

    privateEventMap.set("notifyError", this.notifyError.bind(this));
    privateEventMap.set("notifyTerminalMessage", this.notifyTerminalMessage.bind(this));
    privateEventMap.set("reload", this.reload.bind(this));
    privateEventMap.set("logout", this.logout.bind(this));
    privateEventMap.set("rtcCallEnd", this.rtcCallEnd.bind(this));
    privateEventMap.set("rtcCallReceived", this.rtcCallReceived.bind(this));
    privateEventMap.set("alarmModalReady", this.alarmModalReady.bind(this));
    privateEventMap.set("alarmNotice", this.alarmNotice.bind(this));
  }
  public async initGlobalState(): Promise<void> {
    // 鉴权信息初始化
    await initAuthorization(this.terminal);
    if (!this.mfRootState.authInfo?.token) {
      return;
    }
    // 依次检查handleXXX注册状态
    if (!this.handleError) {
      throw new Error("MfRootGlobalState onError未注册");
    }
    if (!this.handleReload) {
      throw new Error("MfRootGlobalState onReload未注册");
    }
    if (!this.handleLogout) {
      throw new Error("MfRootGlobalState onLogout未注册");
    }
    try {
      // 用户信息初始化
      await initUserInfo();
    } catch {
      // 初始化失败可能是因为鉴权失效了
      this.logout();
    }
    // 消息socket初始化
    initMessageSocket({
      subscribeType: this.messageSocketSubscribeType,
    });
    // RTC通信初始化
    this.handleRtcReceived && initCommunication();
  }

  /** 内部报错提示 */
  public onError(callback: (errorMsg: string) => void): void {
    this.handleError = callback;
  }

  /** 应用重载 */
  public onReload(callback: () => void): void {
    this.handleReload = callback;
  }

  /** 登出 */
  public onLogout(callback: () => void): void {
    this.handleLogout = callback;
  }
  /** 接收到终端消息 */
  public onTerminalMessage(callback: (message: unknown) => void): void {
    this.handleTerminalMessage = callback;
  }

  /** RTC通话结束 */
  public onRtcCallEnd(callback: () => void): void {
    this.handleRtcCallEnd = callback;
  }

  /** 报警弹窗就绪 */
  public onAlarmModalReady(callback: (instance: CubeAlarmModal) => void): void {
    this.handleAlarmModalReady = callback;
  }

  /** RTC来电 */
  public onRtcCallReceived(callback: (userInfo: UserInfo) => void): void {
    this.handleRtcReceived = callback;
  }
  /** 消息已读 */
  public checkedMessageRead(id: string): void {
    messageRead(id);
  }

  public async refreshToken(tenant: string): Promise<void> {
    new CubeAuthService(this.terminal, tenant, this.mfRootState.authInfo?.token)
      .refreshToken(this.mfRootState.refreshToken)
      .then((res) => {
        this.mfRootState.setAuthInfo(
          {
            token: res.access_token,
            tenant,
            terminal: this.terminal,
          },
          res.refresh_token,
          res.jti,
        );
        this.reload();
      })
      .catch(() => {
        // 刷新token失败也退出登录
        this.logout();
      });
  }

  /** 集团告警 */
  public onHeadquartersAlarm(callback: (message: unknown) => void): void {
    privateEventMap.set("headquartersAlarm", callback);
  }

  /** 报警通知 */
  public onAlarmNotice(callback: (message: unknown) => void): void {
    privateEventMap.set("alarmNotice", callback);
  }

  private notifyError(errorMsg: string): void {
    if (this.handleError) {
      this.handleError(errorMsg);
    }
  }
  private notifyTerminalMessage(message: unknown): void {
    if (this.handleTerminalMessage) {
      this.handleTerminalMessage(message);
    }
  }
  private reload(): void {
    if (this.handleReload) {
      this.handleReload();
    }
  }
  private logout(): void {
    if (this.handleLogout) {
      this.handleLogout();
    }
  }

  private rtcCallEnd(): void {
    if (this.handleRtcCallEnd) {
      this.handleRtcCallEnd();
    }
  }

  private rtcCallReceived(userInfo: UserInfo): void {
    if (this.handleRtcReceived) {
      this.handleRtcReceived(userInfo);
    }
  }

  private alarmModalReady(instance: CubeAlarmModal): void {
    if (this.handleAlarmModalReady) {
      this.handleAlarmModalReady(instance);
    }
  }

  private alarmNotice(data: unknown): void {
    if (this.handleAlarmNotice) {
      this.handleAlarmNotice(data);
    }
  }
}
