export interface RecordType {
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
  callTime: string;
  deviceName: string;
  bed: string;
}
export interface CallBedType {
  id: string;
  bed: string;
  currentVisitId: string;
  dateHospitalization: string;
  dischargeDate: string;
  currentPatient: string;
  bedManagementDoctor: string;
  bedNurse: string;
  patientGender: number;
  attendingPhysician: string;
  pathologicalInformation: string;
  medicationInformation: string;
  age: string | number;
}
export interface DeviceSceneConfig {
  businessId: string;
  businessType: string;
  id: string;
  sceneType: string;
  sceneTypeSequence?: string;
}
