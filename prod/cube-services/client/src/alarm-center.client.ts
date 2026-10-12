import { makeCreateRequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type {
  AlarmCenterGateway,
  AlarmEventStatusRecord,
  AlarmNearbyDevice,
  AlarmRecord,
} from "@ghcloud/cube-service-interface/alarm-center";
import type { Pagination } from "@ghcloud/cube-service-interface/base";

import { normalizePagination, sendAlarmCenterJson, sendAlarmCenterVoid } from "./alarm-center-request";
import { useAuthRequest } from "./auth-request";

const ALARM_CENTER_API = `${BASE_API}/alarm`;
const LINKAGE_API = `${BASE_API}/linkage`;

export const getAlarmStatisticsLevel: AlarmCenterGateway["getAlarmStatisticsLevel"] = async (query) =>
  useAuthRequest(() => sendAlarmCenterJson(makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-statistics/level`, payload: { ...query } })));

export const getAlarmEventStatusPage: AlarmCenterGateway["getAlarmEventStatusPage"] = async (query) => {
  const response = await useAuthRequest(() =>
    sendAlarmCenterJson<Pagination<AlarmEventStatusRecord> | AlarmEventStatusRecord[]>(
      makeGETRequest({
        url: `${ALARM_CENTER_API}/alarm-statistics/event-status-page`,
        payload: { ...query },
      }),
    ),
  );
  return normalizePagination<AlarmEventStatusRecord>(response);
};

export const getAlarmRecordPage: AlarmCenterGateway["getAlarmRecordPage"] = async (query) => {
  const response = await sendAlarmCenterJson<Pagination<AlarmRecord> | AlarmRecord[]>(
    makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-records`, payload: { ...query } }),
  );
  return normalizePagination<AlarmRecord>(response);
};

export const deleteAlarmRecords: AlarmCenterGateway["deleteAlarmRecords"] = async (payload) => {
  await sendAlarmCenterVoid(makeCreateRequest({ url: `${ALARM_CENTER_API}/alarm-record/batch-deleted`, payload: { ...payload } }));
};

export const transferAlarmRecord: AlarmCenterGateway["transferAlarmRecord"] = async (id, payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/transfer/${id}`, payload: { ...payload } }));
};

export const assignAlarmRecord: AlarmCenterGateway["assignAlarmRecord"] = async (id, payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/dynamic/assign/${id}`, payload: { ...payload } }));
};

export const suspendAlarmRecord: AlarmCenterGateway["suspendAlarmRecord"] = async (id, payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/suspend/${id}`, payload: { ...payload } }));
};

export const handleAlarmRecord: AlarmCenterGateway["handleAlarmRecord"] = async (id, payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/handler/${id}`, payload: { ...payload } }));
};

export const confirmAlarmRecord: AlarmCenterGateway["confirmAlarmRecord"] = async (id) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/confirmed/${id}` }));
};

export const urgeAlarmRecords: AlarmCenterGateway["urgeAlarmRecords"] = async (payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${ALARM_CENTER_API}/alarm-record/urging`, payload: { ...payload } }));
};

export const repeatPushAlarm: AlarmCenterGateway["repeatPushAlarm"] = async (businessKey) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${LINKAGE_API}/linkage/rule/re-trigger-event/${businessKey}` }));
};

export const getAlarmRecordDetail: AlarmCenterGateway["getAlarmRecordDetail"] = async (id) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-record/${id}` }));
};

export const getAlarmOperatorRecords: AlarmCenterGateway["getAlarmOperatorRecords"] = async (id) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-record/operatorLogs/${id}` }));
};

export const createAlarmFollow: AlarmCenterGateway["createAlarmFollow"] = async (payload) => {
  return sendAlarmCenterJson(makeCreateRequest({ url: `${ALARM_CENTER_API}/alarm-record/follow-up`, payload: { ...payload } }));
};

export const getAlarmFollowList: AlarmCenterGateway["getAlarmFollowList"] = async (id) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-record/${id}/follow-ups`, payload: { id } }));
};

export const getAlarmReasons: AlarmCenterGateway["getAlarmReasons"] = async () => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-reasons` }));
};

export const getAlarmLinkageActions: AlarmCenterGateway["getAlarmLinkageActions"] = async (eventId) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${LINKAGE_API}/event-iot-device-pros/${eventId}` }));
};

export const getAlarmLinkageExecuteRecords: AlarmCenterGateway["getAlarmLinkageExecuteRecords"] = async (eventId) => {
  return sendAlarmCenterJson(makeGETRequest({ url: `${LINKAGE_API}/event-iot-device-pro-records/${eventId}` }));
};

export const executeAlarmLinkage: AlarmCenterGateway["executeAlarmLinkage"] = async (payload) => {
  await sendAlarmCenterVoid(makeUpdateRequest({ url: `${LINKAGE_API}/event-iot-device-pro/ctrl`, payload: { ...payload } }));
};

export const oneKeyExecuteAlarmLinkage: AlarmCenterGateway["oneKeyExecuteAlarmLinkage"] = async (eventId) => {
  await sendAlarmCenterVoid(makeCreateRequest({ url: `${LINKAGE_API}/event/${eventId}/iot-device-pro/hand/ctrl` }));
};

export const getAlarmNearbyDevices: AlarmCenterGateway["getAlarmNearbyDevices"] = async (query) => {
  const response = await sendAlarmCenterJson<Pagination<AlarmNearbyDevice> | AlarmNearbyDevice[]>(
    makeGETRequest({ url: `${ALARM_CENTER_API}/alarm-records/ref/devices`, payload: { ...query } }),
  );
  return normalizePagination<AlarmNearbyDevice>(response);
};
