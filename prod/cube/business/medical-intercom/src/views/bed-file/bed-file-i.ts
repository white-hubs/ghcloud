export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  bedNum: string | number | undefined;
  currentPatient: string | undefined;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
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
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
