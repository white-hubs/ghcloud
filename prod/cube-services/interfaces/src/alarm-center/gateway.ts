import type { Pagination } from "@ghcloud/cube-service-interface/base";

import type {
  AlarmAssignPayload,
  AlarmEventStatusPageQuery,
  AlarmFollowPayload,
  AlarmHandlePayload,
  AlarmLinkageExecutePayload,
  AlarmNearbyDeviceQuery,
  AlarmRecordBatchDeletePayload,
  AlarmRecordPageQuery,
  AlarmSuspendPayload,
  AlarmTransferPayload,
  AlarmUrgePayload,
} from "./request";
import type {
  AlarmDetail,
  AlarmEventStatusRecord,
  AlarmFollowRecord,
  AlarmLinkageActionDevice,
  AlarmLinkageExecuteRecord,
  AlarmLevelStatistic,
  AlarmNearbyDevice,
  AlarmOperatorRecord,
  AlarmReason,
  AlarmRecord,
} from "./response";

export interface AlarmCenterGateway {
  getAlarmStatisticsLevel: (query: { period?: string; applicationCode: string; type?: string }) => Promise<AlarmLevelStatistic[]>;
  getAlarmEventStatusPage: (query: AlarmEventStatusPageQuery) => Promise<Pagination<AlarmEventStatusRecord>>;
  getAlarmRecordPage: (query: AlarmRecordPageQuery) => Promise<Pagination<AlarmRecord>>;
  deleteAlarmRecords: (payload: AlarmRecordBatchDeletePayload) => Promise<void>;
  transferAlarmRecord: (id: string, payload: AlarmTransferPayload) => Promise<void>;
  assignAlarmRecord: (id: string, payload: AlarmAssignPayload) => Promise<void>;
  suspendAlarmRecord: (id: string, payload: AlarmSuspendPayload) => Promise<void>;
  handleAlarmRecord: (id: string, payload: AlarmHandlePayload) => Promise<void>;
  confirmAlarmRecord: (id: string) => Promise<void>;
  urgeAlarmRecords: (payload: AlarmUrgePayload) => Promise<void>;
  repeatPushAlarm: (businessKey: string) => Promise<unknown>;
  getAlarmRecordDetail: (id: string) => Promise<AlarmDetail>;
  getAlarmOperatorRecords: (id: string) => Promise<AlarmOperatorRecord[]>;
  createAlarmFollow: (payload: AlarmFollowPayload) => Promise<unknown>;
  getAlarmFollowList: (id: string) => Promise<AlarmFollowRecord[]>;
  getAlarmReasons: () => Promise<AlarmReason[]>;
  getAlarmLinkageActions: (eventId: string) => Promise<AlarmLinkageActionDevice[]>;
  getAlarmLinkageExecuteRecords: (eventId: string) => Promise<AlarmLinkageExecuteRecord[]>;
  executeAlarmLinkage: (payload: AlarmLinkageExecutePayload) => Promise<void>;
  oneKeyExecuteAlarmLinkage: (eventId: string) => Promise<void>;
  getAlarmNearbyDevices: (query: AlarmNearbyDeviceQuery) => Promise<Pagination<AlarmNearbyDevice>>;
}
