export interface StaffResultList {
  staffId: string;
  staffName: string;
  mobile: string;
  startWorkTime?: any;
  endWorkTime?: any;
  className: string;
  classStartTime: string;
  classEndTime: string;
}

export interface DutyPersonnel {
  totalCount: number;
  workCount: number;
  staffResultList: StaffResultList[];
}
