import type { LegacyAssistantCommand } from "@ghcloud/cube-ai-application-app";

export type Command = LegacyAssistantCommand;

export interface CommandExecuteResult {
  callbackId?: string;
  result: "success" | "fail";
  message?: string;
}

export type CommandHandler = (params?: Command["params"]) => void | boolean | Promise<void | boolean>;

type CommandMapGlobal = typeof globalThis & {
  __CUBE_AI_COMMAND_MAP__?: Map<string, CommandHandler>;
};

/**
 * 必须挂在 globalThis：Vite HMR 重载本模块时会新建空 Map，
 * 而 header 的 onMounted 不会重跑，导致「指令下发失败」。
 */
export const commandMap: Map<string, CommandHandler> = (() => {
  const g = globalThis as CommandMapGlobal;
  if (!g.__CUBE_AI_COMMAND_MAP__) {
    g.__CUBE_AI_COMMAND_MAP__ = new Map();
  }
  return g.__CUBE_AI_COMMAND_MAP__;
})();

function coerceParams(raw: Command["params"] | string | undefined): Command["params"] {
  if (raw == null) {
    return undefined;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Command["params"];
      }
    } catch {
      return { value: trimmed };
    }
    return { value: trimmed };
  }
  if (typeof raw === "object") {
    return raw;
  }
  return undefined;
}

export type ExecuteCommandResult = {
  ok: boolean;
  reason?: string;
};

export const executeCommand = async (command: Command): Promise<boolean> => {
  const detail = await executeCommandDetailed(command);
  return detail.ok;
};

export const executeCommandDetailed = async (command: Command): Promise<ExecuteCommandResult> => {
  const commandFunc = commandMap.get(command.action);
  if (!commandFunc) {
    const reason = `未注册指令 handler（当前 keys: ${[...commandMap.keys()].join(",") || "空"}）`;
    console.warn("[cube-ai-command] handler missing", command.action, [...commandMap.keys()]);
    executeCallBack({
      callbackId: command.callbackId,
      result: "fail",
      message: reason,
    });
    return { ok: false, reason };
  }
  try {
    const params = coerceParams(command.params as Command["params"] | string | undefined);
    const result = await commandFunc(params);
    if (result === false) {
      const reason = `handler 返回失败 params=${JSON.stringify(params ?? null)}`;
      console.warn("[cube-ai-command] execute failed", command.action, params);
      executeCallBack({
        callbackId: command.callbackId,
        result: "fail",
        message: reason,
      });
      return { ok: false, reason };
    }
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "指令执行异常";
    console.warn("[cube-ai-command] execute exception", command.action, error);
    executeCallBack({
      callbackId: command.callbackId,
      result: "fail",
      message: reason,
    });
    return { ok: false, reason };
  }
};

/** 回复指令执行的结果 */
export const executeCallBack = (callbackParams: CommandExecuteResult) => {
  // TODO: 新版 AI 模型/命令协议接入后，在这里把 UE5 指令执行结果回传给模型侧。
  window.dispatchEvent(new CustomEvent("CUBE_AI_COMMAND_EXECUTE_RESULT", { detail: callbackParams }));
};
