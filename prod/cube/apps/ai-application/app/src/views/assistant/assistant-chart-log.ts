/** 助手图表渲染日志：失败时必须 console 可见，不吞异常细节 */
export function logAssistantChartError(scope: string, message: string, context: Record<string, unknown> = {}, error?: unknown): void {
  const payload = {
    scope,
    message,
    ...context,
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
  };
  console.error(`[assistant-chart] ${scope}: ${message}`, payload);
  if (error instanceof Error && error.stack != null) {
    console.error(error.stack);
  }
}

export function logAssistantChartInfo(scope: string, message: string, context: Record<string, unknown> = {}): void {
  if (!import.meta.env.DEV) {
    return;
  }
  console.info(`[assistant-chart] ${scope}: ${message}`, context);
}
