export type FireEventType = "alarm" | "info" | "fault";

export interface FireEventRecord {
  id: string;
  eventCode: string;
  eventName: string;
  eventType: FireEventType;
  hostId: string;
  hostName: string;
  circuit: string;
  address: string;
  code: string;
  deviceInfo: string;
  pointName: string;
  location: string;
  eventTime: string;
}

export interface EventRecordFilters {
  eventCode: string;
  hostId: string;
  location: string;
  startDate: string;
  endDate: string;
}

export const DEFAULT_EVENT_RECORD_FILTERS: EventRecordFilters = {
  eventCode: "",
  hostId: "",
  location: "",
  startDate: "",
  endDate: "",
};
