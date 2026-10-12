export interface DevicesStatus {
  name: string;
  value: number;
  ringRatio: string;
}
export interface TypeProportion {
  data: DevicesStatus[];
  total: number;
  ringRatio: number;
}
interface DoorEventRecordRecords {
  eventName: string;
  eventTime: string;
  personName: string;
  doorName: string;
  eventResult: string;
  eventWay: string;
}
export interface DoorEventRecordList {
  total: number;
  records: DoorEventRecordRecords[];
}
