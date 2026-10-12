export interface RegionVo {
  id: string;
  parentId: string | null;
  level: number;
  children: RegionVo[];
  name: string;
  coordinate: string;
  zoom: string;
  createTime: number;
  sequence: string;
  sort: number;
  state: string;
}
export interface PointTypeVo {
  id: string;
  code: string;
  filePath: string;
  name: string;
}
export interface PointVo {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  typeFilePath: string;
  areaId: string;
  areaName: string;
  address: string;
  coordinate: string;
  remarks: string;
  level: number;
  state: string;
  filePath: string;
}
export interface PageVo<T> {
  records: T[];
  pages: number;
  total: number;
}
interface Area {
  id: string;
  name: string;
  coordinate: string;
  createTime: number;
  zoom: string;
  level: number;
  sort: number;
  state: string;
  parentId: null | string;
  sequence: string;
}
export interface LayerInfoVo {
  id: string;
  layerName: string;
  layerFile: string;
  createTime: number;
  state: string;
  southwest: string;
  northeast: string;
  center: string;
  area: Area;
}
export interface GuideDeviceVo {
  name: string;
  logo: string;
  coordinate: string;
  zoom: string;
  id: string;
  title: string;
}
