export interface ProjectSupervise {
  showProjectType: boolean;
  showDatePicker: boolean;
  showDeptSelect: boolean;
  showDateRangePicker: boolean;
  loading: boolean;
  formState: {
    projectName: string;
    typeId: string;
    typeName: string;
    completionTime: string;
    constructionSite: string;
    superviseDep: string;
    duration: string;
    superviseDepName: string;
    constructB: string;
    partyB: string;
    superviseUsers: string;
    safetyDockUserId: string;
    remarks: string;
    stallCode?: string;
    stallLiaison?: string;
    stallMobile?: string;
    partyBMobile?: string;
    projectFiles: string;
  };
  files: { id: string; name: string; path: string; }[];
  fileVOS?: { id: string;path: string;type: string; }[];
  userNames: string[] | string;
  typeOptions: { name: string; id: string; }[];
  rangeType: string;
  dataRange: Record<string, string>;
  safetyDockUserNames: string[] | string;
  superviseDepList: { text: string; value: string; }[];
  superviseDepNemas: string[];
}

export type StoreKey = 'checkSuperviseUsers' | 'checkSafetyDockUser';