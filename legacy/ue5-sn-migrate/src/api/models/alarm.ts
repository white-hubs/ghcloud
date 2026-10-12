export interface AlarmLevelType {
    alarmNum: number,
    chainRatio: number,
    code?: string,
    name: string,
    isGrow?: boolean,
    color?: string
    id?:string
}


// 报警状态
export interface AlarmStatus {
    alarmNum: number,
    alarmStatus: string,
    alarmStatusName: string,
    color?: string
}
export interface AlarmStatusData {
    alarmNum: number,
    chainRatio: number,
    alarmStatusStatistics: AlarmStatus[]
}
// 报警趋势图
export interface AlarmTrend {
    alarmNum: number,
    period: string
}
// 报警区域Top5
export interface AlarmAreaTop {
    alarmNum: number,
    chainRatio: number,
    id: string,
    name: string,
    ratio: number
}
export interface AlarmTakeNotesList {
    id: string,
    businessKey: string,
    alarmTime: string,
    alarmLevelName: string,
    alarmEventName: string,
    alarmStatus: string,
    alarmStatusName: string
}
// 报警记录列表
export interface AlarmTakeNotesData {
    pages: number,
    records: AlarmTakeNotesList[],
    total: number
}
// 报警率
export interface AlarmRate {
    deviceTotal: string
    alarmNum: string
    chainRatio: string
    proportion: number
}
// 报警记录状态
export interface RecordStatusType {
    alarmNum: number,
    alarmUnresolvedHandlerNum: number,
    alarmTimeoutNum: number,
    alarmHandlerNum: number,
}
// 泸州三维设备报警
export interface LuzhouEquipmentAlarmType {
    alarmTargetStatistics: {
        alarmNum: number;
        chainRatio: number;
    };
    alarmTargetTrend: {
        alarmNum: number;
        period: string
    }[]
}
//产品分类报警top5
export interface StatisticsDeviceType {
    alarmNum: string;
    chainRatio: string;
    typeName: string;
}
export interface AbnormalStatisticsType{
    equipmentDeviceTotal:number;
    equipmentList:any[];
    equipmentTotal:number;
    xtitle:any[];
}