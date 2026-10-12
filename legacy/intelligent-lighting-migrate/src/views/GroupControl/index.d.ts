declare namespace GroupList {
  interface getListType {
    pageNumber: number | undefined;
    pageSize: number;
    total: number | undefined;
    keyword: string;
  }
  interface ListType {
    deviceDetails: string[];
    groupControlName: string;
    id: string;
    isLock: boolean;
    num: number;
    password: string;
    updateTime: number;
  }
}
