export interface ModelValueItf{
value?: any
    timeType: string;
    dateRange?: string[];
}
export interface pieType {
    value:number,
    label:string,
    color:string,
    name?:string
}
export interface AlarmRateList {
    title: string,
    value: number|string,
    ringRatio?: boolean,
    color?: string,
    label?: string|number,
    unit?: string,
}
export interface AreaProgressData {
    statistic: { name: string; total: number; ratio: number | string; buildCount: number; businessCount: number;};
    buildData:  { total: number; rented: number; UnRent: number; imgPath: string; iconPath?: string;};
    businessData: { total: number; offline: number; online: number; imgPath: string; iconPath?: string;};
}