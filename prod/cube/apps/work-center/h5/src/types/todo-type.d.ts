
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import type { WorkTaskPageVO } from '@ghcloud/cube-work-center-service/src/type'
import { type FileState } from '@ghcloud/cube-utils'

export interface HandoverFormState {
  signature: string;
  loading: boolean;
  formState: {
    users?: string;
    userNames?: string[] | string;
    remarks?: string| undefined;
    userList: PersonItem[];
    fileList: FileState[];
    attInfo1?: string;
    file1?: FileState[];
    attInfo2?: string;
    file2?: FileState[];
    attInfo3?: string;
    file3?: FileState[];
    attInfo4?: string;
    file4?: FileState[];
    items: WorkTaskPageVO[];
    shiftSignFileId: string;
  };
}

export interface H5ApplicationType {
  applicationCode: string;
  path: string;
  query: {
    id?: string;
    userId?: string;
    processType?: string;
    taskId?: string;
    businessType?: string;
    processId?: string;
  };
}

export interface TabStatus { 
  statuses: string[];
  code: string;
  name: string;
}