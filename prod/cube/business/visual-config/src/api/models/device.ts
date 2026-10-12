export interface DeviceGenreType {
  id: string;
  name: string;
  typeName: string;
  expand: string | null;
  icon: string | null;
  picture: string | null;
}
export interface DeviceType {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  brandName: string;
  code: string;
  departmentId: string;
  departmentName: string;
  genreId: string;
  genreName: string;
  modelId: string;
  modelName: string;
  monitors: [];
  professionName: string;
  securityLocked: boolean;
  status: string;
  statusName: string;
}
export interface DeviceSceneConfig {
  businessId: string;
  businessType: string;
  id: string;
  sceneType: string;
  sceneTypeSequence?: string;
}
