import { timeFormat } from '@/utils/common'
const unitMap=new Map([
  ['electricity_meter','kWh'],
  ['water_meter','m³'],
  ['gas_meter','m³'],
  ['fuel_meter','kg'],
  ['heat_meter','kg'],
  ['cool_meter','m³'],
  ['renewable_energy','kWh'],
  ['other','kWh'],
])
export const classifyColumns=[
  {
    title: "日期",
    dataIndex: "statDate",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return timeFormat(text,false)
    },
  },
  {
    title: "能源分类",
    dataIndex: "instrumentTypeName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "用量",
    dataIndex: "ddValue",
    ellipsis: true,
    align:'center',
    customRender: ({ record,text }:{record:any,text:string}) => {
      return text? text+unitMap.get(record.instrumentType): '--' ;
    },
  },
  {
    title: "峰用量",
    dataIndex: "fValue",
    ellipsis: true,
    align:'center',
    customRender: ({ record,text }:{record:any,text:string}) => {
      return text? text+unitMap.get(record.instrumentType): '--' ;
    },
  },
  {
    title: "平用量",
    dataIndex: "pValue",
    ellipsis: true,
    align:'center',
    customRender: ({ record,text }:{record:any,text:string}) => {
      return text? text+unitMap.get(record.instrumentType): '--' ;
    },
  },
  {
    title: "谷用量",
    dataIndex: "gValue",
    ellipsis: true,
    align:'center',
    customRender: ({ record,text }:{record:any,text:string}) => {
      return text? text+unitMap.get(record.instrumentType): '--' ;
    },
  },
  {
    title: "尖用量",
    dataIndex: "jValue",
    ellipsis: true,
    align:'center',
    customRender: ({ record,text }:{record:any,text:string}) => {
      return text? text+unitMap.get(record.instrumentType): '--' ;
    },
  }
]
export const subItemColumns=[
  {
    title: "日期",
    dataIndex: "statDate",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return timeFormat(text,false)
    },
  },
  {
    title: "编码",
    dataIndex: "projectCode",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "分项名称",
    dataIndex: "projectName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "能源分类",
    dataIndex: "instrumentTypeName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "用量",
    dataIndex: "ddValue",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
]
export const areaColumns=[
  {
    title: "日期",
    dataIndex: "statDate",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return timeFormat(text,false)
    },
  },
  {
    title: "区域名称",
    dataIndex: "projectName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "能源分类",
    dataIndex: "instrumentTypeName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
  {
    title: "用量",
    dataIndex: "ddValue",
    ellipsis: true,
    align:'center',
    customRender: ({ text }:{text:string}) => {
      return text as string ?? '--' ;
    },
  },
]