export interface FormState {
  id: string | null;
  projectId: string | null;
  instanceName: string | null;
}
export const initFormData: FormState = {
  id: null,
  projectId: null,
  instanceName: '',
}
export interface PublishState {
  id: string | null;
  projectId: string | null;
  projectName: string | null;
  status: string | null;
  switchStatus: boolean | null;
  instanceName: string | null;
  path: string | null;
  createTime: string | null;
  updateTime: string | null;
}

export const StatusOptions = [
  { label: '禁用', value: 'DISABLE' },
  { label: '启用', value: 'ENABLE' },
]
