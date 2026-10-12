import { type Component, defineAsyncComponent } from 'vue'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const command_dispatch_cards: Record<string, Component> = {
  // 报警级别统计
  'command-dispatch-alarm-level': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/alarm-level-statistics/alarm-level-statistics')).AlarmLevelStatistics)),
  // 报警处理排名
  'command-dispatch-alarm-rank': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/alarm-handling-ranking/alarm-handling-ranking')).AlarmHandlingRanking)),
  // 报警正确率
  'command-dispatch-alarm-accuracy': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/alarm-accuracy/alarm-accuracy')).AlarmAccuracy)),
  // 当日值班人员
  'command-dispatch-duty-person': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/duty-personnel/duty-personnel')).DutyPersonnel)),
  // 应急广播使用情况
  'command-dispatch-emergency-broadcast': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/emergency-broadcast/emergency-broadcast')).EmergencyBroadcast)),
  // 报警事件处理情况
  'command-dispatch-alarm-event': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/alarm-event-handling/alarm-event-handling')).AlarmEventHandling)),
  // 报警区域TOP5
  'command-dispatch-alarm-area-top5': defineAsyncComponent(async () => ((await import('@/components/businessPanel/command-dispatch-v2/cards/alarm-area-top5/alarm-area-top5')).AlarmAreaTop5)),

  
}