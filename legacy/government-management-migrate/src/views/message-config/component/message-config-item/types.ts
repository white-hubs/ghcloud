export enum OuaaEnum {
  USER = 'USER',
  POST = 'POST',
  ROLE = 'ROLE',
  DEPARTMENT = 'DEPARTMENT',
}

export const ouaaOptions = [
  { label: '人员', value: OuaaEnum.USER },
  { label: '岗位', value: OuaaEnum.POST },
  { label: '角色', value: OuaaEnum.ROLE },
  { label: '部门', value: OuaaEnum.DEPARTMENT },
]
