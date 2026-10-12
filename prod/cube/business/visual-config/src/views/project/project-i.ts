export const initFormData: FormState = {
  id: '',
  projectName: '',
  mainStructure: 'structure-one',
  canvas: '16:9',
}
export interface FormState {
  id?: string | null;
  projectName: string | null;
  canvas: string | null;
  mainStructure: string | null;
}
export interface ProjectState {
  id?: string | null;
  projectName: string | null;
  canvas: string | null;
  mainStructure: string | null;
}
export interface IModal {
  visible: boolean;
  title: string;
}
