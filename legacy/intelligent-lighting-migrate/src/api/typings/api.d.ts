declare namespace api {
  type ApplecationCode = "INTELLIGENT_LIGHTING";
  interface getListType {
    keyword?: any;
    pageNumber: number | undefined;
    pageSize: number | undefined;
  }
  interface addGroup {
    groupControlName: string;
    password: string;
    confirmpass: string;
    deviceDetails: string[];
    ascription: string;
  }
  interface deviceType {
    id: string;
    deviceId: string;
    deviceName: string;
    areaName: string;
  }
}
