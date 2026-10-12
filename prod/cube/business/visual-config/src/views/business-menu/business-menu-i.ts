import type { UploadFile } from 'ant-design-vue'
export const initFormData: FormState = {
  id: null,
  name: '',
  sort: 1,
  parentId: null,
  fileId: '',
  scenarioTypes: ['BUILD'],
  scenarioType: 'BUILD',
  fileList: [],
  remark: '',
  code: '',
}
export interface FormState {
  id: string | null;
  name: string;
  sort: number;
  scenarioTypes: string[];
  scenarioType: string;
  parentId: string | number | null;
  fileId: number | string;
  fileList: UploadFile[];
  remark: string | null;
  code?: string;
}
export interface SceneMenuData {
  id: string;
  name: string;
  sort: number;
  code: string;
  parentId: string | null;
  level: number;
  scenarioType: string;
  scenarioTypes: string[];

  fileVO: ReturnFileType;
  children: SceneMenuData[];
  remark: string | null;
}
export interface IModal {
  visible: boolean;
  title: string;
}
