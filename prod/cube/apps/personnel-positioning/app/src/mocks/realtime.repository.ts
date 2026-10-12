import { ALARM_ATTACHMENT_MAX_COUNT, ALARM_OPINION_MAX_LENGTH } from "../constants/realtime";
import type { AlarmAction, AlarmAttachment, PositionAlarm, RealtimeState } from "../models/realtime";
import { availableAlarmActions } from "../utils/realtime";

export function createRealtimeRepository(state: RealtimeState) {
  function findAlarm(id: string): PositionAlarm | undefined {
    return state.alarms.find((alarm) => alarm.id === id);
  }
  function operateAlarm(id: string, action: AlarmAction, opinion: string, assignee = "", attachments: AlarmAttachment[] = []): void {
    const alarm = findAlarm(id);
    if (!alarm) {
      throw new Error("告警不存在，请返回实时定位刷新");
    }
    if (!availableAlarmActions(alarm).includes(action)) {
      throw new Error("告警状态已变化，当前操作不可用");
    }
    const text = opinion.trim();
    if (!text || text.length > ALARM_OPINION_MAX_LENGTH) {
      throw new Error(`请填写处置意见，最多${ALARM_OPINION_MAX_LENGTH}字`);
    }
    if (action === "assign" && !assignee.trim()) {
      throw new Error("请选择处置人");
    }
    if (attachments.length > ALARM_ATTACHMENT_MAX_COUNT) {
      throw new Error(`最多添加${ALARM_ATTACHMENT_MAX_COUNT}个附件`);
    }
    const at = new Date().toISOString();
    if (action === "confirm") {
      alarm.state = "confirmed";
    }
    if (action === "assign") {
      alarm.state = "processing";
      alarm.assignee = assignee;
    }
    if (action === "falseAlarm" || action === "close") {
      alarm.state = "closed";
      alarm.closedAt = at;
    }
    alarm.operations.push({
      id: crypto.randomUUID(),
      action,
      at,
      operator: "当前演示用户",
      opinion: text,
      assignee: action === "assign" ? assignee : "",
      attachments: attachments.map((item) => ({ ...item })),
    });
  }
  return { state, findAlarm, operateAlarm };
}
