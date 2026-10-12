export const basicInfoState = [
  {
    label: '店铺名称',
    field: 'name',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '档主编号',
    field: 'code',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '负责人姓名',
    field: 'shiftMaster',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '负责人手机号',
    field: 'shiftMasterPhone',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '负责人身份证号码',
    field: 'shiftMasterCard',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '联系人',
    field: 'liaison',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '联系人手机号',
    field: 'phone',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '备注',
    field: 'remark',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
]
