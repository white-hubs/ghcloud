import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";

import type { AlarmRecord } from "../../alarm-record-types";

type ActionRecord = AlarmRecord | PlatformAlarmRecord | null;

export const getAlarmEventName = (record: ActionRecord): string => record?.alarmEventName || "当前报警";

export const renderAlarmActionTitle = (actionName: string, record: ActionRecord): JSX.Element => (
  <div class="alarm-action-title">
    <span class="alarm-action-title__name">{actionName}</span>
    <span class="alarm-action-title__event">{getAlarmEventName(record)}</span>
  </div>
);

export const renderAlarmActionSummary = (record: ActionRecord): JSX.Element => (
  <div class="alarm-action-summary">
    <span>{getAlarmEventName(record)}</span>
    {record?.alarmTargetName ? <span>{record.alarmTargetName}</span> : null}
  </div>
);
