declare namespace Lighting {
  interface LightingListType {
    planName: string;
    planStartTime: number;
    planEndTime: number;
    num: number;
    id: string;
    enabled: boolean;
  }
  interface getListType {
    keyword: string;
    pageNumber: number;
    pageSize: number;
    total?: number;
  }
}
