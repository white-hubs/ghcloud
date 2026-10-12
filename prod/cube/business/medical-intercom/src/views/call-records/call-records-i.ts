export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  deviceId: string | undefined;
  deviceName: string | undefined;
  callTime: string[];
  callType: string | undefined;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  callTime: string;
  deviceName: string;
  areaName: string;
  bed: string;
  name: string;
  id: string;
  code: string;
  recordId?: string;
}
