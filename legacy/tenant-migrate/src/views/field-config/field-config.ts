export const ITEM_CODE = 'FIELD_CONFIG'
export const EMPLOYEE_CONFIG  = 
  {
    name: "企业员工",
    code: "employee",
    variable: {
      fields: [
        { key:'gender',fieldName:'性别', show:true, required:true,alias:'' },
        { key:'managedOrganizationIds',fieldName:'管理部门', show:true, required:false ,alias:''},
        { key:'positionIds',fieldName:'职位', show:true, required:true ,alias:''},
        { key:'appointmentIds',fieldName:'岗位', show:true, required:true ,alias:''},
        { key:'idCard',fieldName:'身份证号', show:false, required:false,alias:'' },
        { key:'pics',fieldName:'员工照片', show:true, required:false,alias:'' },
      ],
      keywords: [
        { key:'company',fieldName:'公司',alias:'' },
        { key:'staff',fieldName:'员工', alias:'' },
      ]
    }
  }
