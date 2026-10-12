
interface Option {
    code?: string;
    name?: string;
    alarmNum?: number;
    chainRatio?: number;

    color?: string;
    img?: string;
    open?: number;
    close?: number;
    data?: number[];
}

import { AlarmLevelType, AlarmRate, RecordStatusType, AlarmStatusData, AlarmTrend, AlarmAreaTop, AlarmTakeNotesData } from '@/api/models/alarm'

import { EquipmentInfo, EquipmentDetails } from '@/api/models/equipment'
import moment from 'moment';

// 报警级别分布
export const mockAlarmLevel = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmLevelType[] => {
    let mokeData = {
        'TODAY': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 10,
                "chainRatio": 10.0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 8,
                "chainRatio": 20.0
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 0,
                "chainRatio": 10.0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 20,
                "chainRatio": 0.0
            }
        ],
        'THIS_WEEK': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 50,
                "chainRatio": 100.0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 164,
                "chainRatio": 100.0
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 60,
                "chainRatio": 100.0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 25,
                "chainRatio": 100.0
            }
        ],
        'THIS_MONTH': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 50,
                "chainRatio": 100.0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 160,
                "chainRatio": 99.0
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 36,
                "chainRatio": 36.0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 10,
                "chainRatio": 10.0
            }
        ],
        'THIS_YEAR': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 50,
                "chainRatio": 100.0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 164,
                "chainRatio": 100.0
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 30,
                "chainRatio": 100.0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 0,
                "chainRatio": 0.0
            }
        ],
    }
    return mokeData[params.timeType];
};

// 报警状态统计
export const mockStatisticsStatus = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmStatusData => {
    let mokeData = {
        'TODAY': {
            "alarmNum": 38,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 20
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 10
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 8
            }]
        },
        'THIS_WEEK': {
            "alarmNum": 172,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 120
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 40
            }]
        },
        'THIS_MONTH': {
            "alarmNum": 202,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 136
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 65
            }]
        },
        'THIS_YEAR': {
            "alarmNum": 202,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 168
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 4
            }]
        },
    }
    return mokeData[params.timeType];
};

// 报警趋势折线图统计
export const mockStatisticsTrend = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmTrend[] => {
    let mokeData = {
        'TODAY': [
            {
                "alarmNum": 0,
                "period": "01"
            }, {
                "alarmNum": 0,
                "period": "02"
            }, {
                "alarmNum": 0,
                "period": "03"
            }, {
                "alarmNum": 100,
                "period": "04"
            }, {
                "alarmNum": 40,
                "period": "05"
            }, {
                "alarmNum": 42,
                "period": "06"
            }, {
                "alarmNum": 0,
                "period": "07"
            }, {
                "alarmNum": 0,
                "period": "08"
            }, {
                "alarmNum": 0,
                "period": "09"
            }, {
                "alarmNum": 0,
                "period": "10"
            }, {
                "alarmNum": 0,
                "period": "11"
            }, {
                "alarmNum": 0,
                "period": "12"
            }
        ],
        'THIS_WEEK': [
            {
                "alarmNum": 0,
                "period": "01"
            }, {
                "alarmNum": 0,
                "period": "02"
            }, {
                "alarmNum": 0,
                "period": "03"
            }, {
                "alarmNum": 0,
                "period": "04"
            }, {
                "alarmNum": 0,
                "period": "05"
            }, {
                "alarmNum": 100,
                "period": "06"
            }, {
                "alarmNum": 72,
                "period": "07"
            }, {
                "alarmNum": 0,
                "period": "08"
            }, {
                "alarmNum": 0,
                "period": "09"
            }, {
                "alarmNum": 0,
                "period": "10"
            }, {
                "alarmNum": 0,
                "period": "11"
            }, {
                "alarmNum": 0,
                "period": "12"
            }
        ],
        'THIS_MONTH': [
            {
                "alarmNum": 0,
                "period": "01"
            }, {
                "alarmNum": 0,
                "period": "02"
            }, {
                "alarmNum": 0,
                "period": "03"
            }, {
                "alarmNum": 152,
                "period": "04"
            }, {
                "alarmNum": 0,
                "period": "05"
            }, {
                "alarmNum": 0,
                "period": "06"
            }, {
                "alarmNum": 0,
                "period": "07"
            }, {
                "alarmNum": 50,
                "period": "08"
            }, {
                "alarmNum": 0,
                "period": "09"
            }, {
                "alarmNum": 0,
                "period": "10"
            }, {
                "alarmNum": 0,
                "period": "11"
            }, {
                "alarmNum": 0,
                "period": "12"
            }
        ],
        'THIS_YEAR': [
            {
                "alarmNum": 0,
                "period": "01"
            }, {
                "alarmNum": 0,
                "period": "02"
            }, {
                "alarmNum": 0,
                "period": "03"
            }, {
                "alarmNum": 0,
                "period": "04"
            }, {
                "alarmNum": 0,
                "period": "05"
            }, {
                "alarmNum": 0,
                "period": "06"
            }, {
                "alarmNum": 150,
                "period": "07"
            }, {
                "alarmNum": 10,
                "period": "08"
            }, {
                "alarmNum": 15,
                "period": "09"
            }, {
                "alarmNum": 17,
                "period": "10"
            }, {
                "alarmNum": 15,
                "period": "11"
            }, {
                "alarmNum": 0,
                "period": "12"
            }
        ],
    }
    return mokeData[params.timeType];
};

// 动环设备
export const mockEquipmentNumber = <T extends Record<string, any>>(params?: {
    timeType?: TimeType;
}): EquipmentInfo => {
    let mokeData = {
        "deviceNum": 30,
        "deviceGenreNums": [{
            "genre": "1554756806335606785",
            "genreName": "烟感",
            "num": 15,
            "proportion": 0.50
        }, {
            "genre": "1641634809765769218",
            "genreName": "喷淋设备",
            "num": 5,
            "proportion": 0.50
        },{
            "genre": "1641634809765769218",
            "genreName": "温感",
            "num": 10,
            "proportion": 0.50
        }],
        "devices": [{
            "deviceId": "1641636035890851841", 
            "code": "",
            "deviceName": "中心机房温湿度传感器",
            "genreName": "温湿度",
            "areaName": "成农批/海鲜广场/4F",
            "areaId": "1547424028313075713-1641758559471480833-1641758764967211009",
            "deviceStatus": "NORMAL"
        }, {
            "deviceId": "1646395282738458626",
            "code": "",
            "deviceName": "A栋1F-02新风机",
            "genreName": "新风机组",
            "areaName": "成农批/北区/五号路口",
            "areaId": "1547424028313075713-1547504002118238209-1612647472797134850",
            "deviceStatus": "NORMAL"
        }],
        "deviceStatusNums": [{
            "name": "NORMAL",
            "num": 25
        }, {
            "name": "OFFLINE",
            "num": 2
        }, {
            "name": "TROUBLE",
            "num": 2
        }, {
            "name": "ALARM",
            "num": 1
        }]
    }
    return mokeData;
};
// 报警处理排名
export const mockStatisticsAreaTop = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmAreaTop[] => {
    let mokeData = {
        'TODAY': [
            {
                "id": "1641758559471480833",
                "name": "12F大门",
                "alarmNum": 17,
                "chainRatio": 18.0,
                "ratio": 50.0
            }, {
                "id": "1547504002118238209",
                "name": "2F大门",
                "alarmNum": 8,
                "chainRatio": 9.0,
                "ratio": 28.0
            }, {
                "id": "1651159322132033538",
                "name": "1F大门",
                "alarmNum": 6,
                "chainRatio": 8.0,
                "ratio": 19.0
            }, {
                "id": "1651153448948805634",
                "name": "3F大门",
                "alarmNum": 4,
                "chainRatio": 70.0,
                "ratio": 14.0
            }, {
                "id": "1651157867392217090",
                "name": "4F大门",
                "alarmNum": 3,
                "chainRatio": 60.0,
                "ratio": 9.0
            }
        ],
        'THIS_WEEK': [
            {
                "id": "1641758559471480833",
                "name": "东区",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区",
                "alarmNum": 150,
                "chainRatio": 90.0,
                "ratio": 96.0
            }, {
                "id": "1651159322132033538",
                "name": "3号门",
                "alarmNum": 120,
                "chainRatio": 80.0,
                "ratio": 80.0
            }, {
                "id": "1651153448948805634",
                "name": "4号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "5号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
        'THIS_MONTH': [
            {
                "id": "1641758559471480833",
                "name": "北区",
                "alarmNum": 188,
                "chainRatio": 100.0,
                "ratio": 100.0
            }, {
                "id": "1547504002118238209",
                "name": "北区01",
                "alarmNum": 166,
                "chainRatio": 90.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "5号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "3号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "2号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
        'THIS_YEAR': [
            {
                "id": "1641758559471480833",
                "name": "2号门",
                "alarmNum": 199,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区",
                "alarmNum": 178,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "北区A1",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "北区B1",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "1号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
    }
    return mokeData[params.timeType];
};

// 报警处理排名 楼层
export const mockStatisticsAreaTopFloor = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmAreaTop[] => {
    let mokeData = {
        'TODAY': [
            {
                "id": "1641758559471480833",
                "name": "北区A01",
                "alarmNum": 155,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区",
                "alarmNum": 78,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "1号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "2号门",
                "alarmNum": 10,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "5号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
        'THIS_WEEK': [
            {
                "id": "1641758559471480833",
                "name": "东区",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区",
                "alarmNum": 11,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "3号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "4号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "5号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
        'THIS_MONTH': [
            {
                "id": "1641758559471480833",
                "name": "北区",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区01",
                "alarmNum": 11,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "5号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "3号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "2号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
        'THIS_YEAR': [
            {
                "id": "1641758559471480833",
                "name": "2号门",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "北区",
                "alarmNum": 11,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "北区A1",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "北区B1",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651157867392217090",
                "name": "1号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }
        ],
    }
    return mokeData[params.timeType];
};

// 报警状态统计 楼层
export const mockStatisticsStatusFloor = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmStatusData => {
    let mokeData = {
        'TODAY': {
            "alarmNum": 182,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 155
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 20
            }]
        },
        'THIS_WEEK': {
            "alarmNum": 172,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 120
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 40
            }]
        },
        'THIS_MONTH': {
            "alarmNum": 202,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 136
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 65
            }]
        },
        'THIS_YEAR': {
            "alarmNum": 202,
            "chainRatio": 100.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 168
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 0
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 4
            }]
        },
    }
    return mokeData[params.timeType];
};

// 报警记录列表
export const mockAlarmStatisticsList = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "total": 4,
            "pages": 1,
            "records": [{
                "id": "1668176161965944834",
                "code": "202306121639249079",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668176152088358913",
                "alarmTime": 1686559151000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686562765000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668175647765245953",
                "code": "202306121637229709",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668175631784947713",
                "alarmTime": 1686559021000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686562642000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668168757912088577",
                "code": "202306121609593351",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668168747497631745",
                "alarmTime": 1686557393000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686561000000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668166925970124801",
                "code": "202306121602428669",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658734392333332482",
                "alarmTargetCode": "YQ-1F-JK-304",
                "alarmTargetName": "南-6号入口-球机1",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668166914561617921",
                "alarmTime": 1686556945000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654131851759005698",
                "alarmEventName": "车辆违停—2号路口、6号路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686560563000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668162130844659713",
                "code": "202306121543396854",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668162120111435777",
                "alarmTime": 1686555800000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686559420000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668161935012605954",
                "code": "202306121542529277",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658389561295794177",
                "alarmTargetCode": "YQ-1F-JK-XZ071",
                "alarmTargetName": "水产1栋6号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668161921779576833",
                "alarmTime": 1686555752000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654112248718766082",
                "alarmEventName": "车辆违停—1号门至冻品区的通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686559373000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668160829989662721",
                "code": "202306121538296126",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668160820229517314",
                "alarmTime": 1686555505000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686559109000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1667928851050737666",
                "code": "202306120016414682",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1667928838413299714",
                "alarmTime": 1686500183000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686503801000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }]
        },
        'THIS_WEEK': {
            "total": 3,
            "pages": 1,
            "records": [{
                "id": "1668175647765245953",
                "code": "202306121637229709",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668175631784947713",
                "alarmTime": 1686559021000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686562642000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668168757912088577",
                "code": "202306121609593351",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668168747497631745",
                "alarmTime": 1686557393000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686561000000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1667928851050737666",
                "code": "202306120016414682",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1667928838413299714",
                "alarmTime": 1686500183000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686503801000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }]
        },
        'THIS_MONTH': {
            "total": 3,
            "pages": 1,
            "records": [{
                "id": "1668175647765245953",
                "code": "202306121637229709",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668175631784947713",
                "alarmTime": 1686559021000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686562642000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668168757912088577",
                "code": "202306121609593351",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668168747497631745",
                "alarmTime": 1686557393000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686561000000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1667928851050737666",
                "code": "202306120016414682",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1667928838413299714",
                "alarmTime": 1686500183000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686503801000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }]
        },
        'THIS_YEAR': {
            "total": 2,
            "pages": 1,
            "records": [{
                "id": "1668175647765245953",
                "code": "202306121637229709",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668175631784947713",
                "alarmTime": 1686559021000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686562642000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1668168757912088577",
                "code": "202306121609593351",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668168747497631745",
                "alarmTime": 1686557393000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686561000000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }, {
                "id": "1667928851050737666",
                "code": "202306120016414682",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1667928838413299714",
                "alarmTime": 1686500183000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686503801000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }]
        },
    }
    return mokeData[params.timeType];
};

export const mockTem = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmTrend[] => {
    let mokeData = {
        'TODAY': [],
        'THIS_WEEK': [],
        'THIS_MONTH': [],
        'THIS_YEAR': [],
    }
    return mokeData[params.timeType];
};
//   安防监控报警统计
export const ecurityAlarmStatistics = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "alarmNum": 18,
            "alarmHandlerNum": 8.5,
            "alarmActualNum": 6,
            "alarmImpracticalNum": 0
        },
        'THIS_WEEK': {
            "alarmNum": 0,
            "alarmHandlerNum": 0,
            "alarmActualNum": 0,
            "alarmImpracticalNum": 0
        },
        'THIS_MONTH': {
            "alarmNum": 299,
            "alarmHandlerNum": 24,
            "alarmActualNum": 23,
            "alarmImpracticalNum": null
        },
        'THIS_YEAR': {
            "alarmNum": 371,
            "alarmHandlerNum": 24,
            "alarmActualNum": 23,
            "alarmImpracticalNum": null
        },
    }
    return mokeData[params.timeType];
};
//   安防监控报警级别统计
export const ecurityAlarmStatisticsLevel = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 0,
                "chainRatio": 0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 15,
                "chainRatio": 7
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 0,
                "chainRatio": 0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 3,
                "chainRatio": 0
            }
        ],
        'THIS_WEEK': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 0,
                "chainRatio": -100
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 74,
                "chainRatio": 100
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 0,
                "chainRatio": 0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 49,
                "chainRatio": 717
            }
        ],
        'THIS_MONTH': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 22,
                "chainRatio": 100
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 129,
                "chainRatio": 100
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 0,
                "chainRatio": 0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 149,
                "chainRatio": 100
            }
        ],
        'THIS_YEAR': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 22,
                "chainRatio": 100
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 129,
                "chainRatio": 100
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 0,
                "chainRatio": 0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 221,
                "chainRatio": 100
            }
        ],
    }
    return mokeData[params.timeType];
};
//   安防监控报警趋势
export const ecurityAlarmTrend = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                "alarmNum": 1,
                "period": "00"
            },
            {
                "alarmNum": 1,
                "period": "01"
            },
            {
                "alarmNum": 2,
                "period": "02"
            },
            {
                "alarmNum": 2,
                "period": "03"
            },
            {
                "alarmNum": 2,
                "period": "04"
            },
            {
                "alarmNum": 2,
                "period": "05"
            },
            {
                "alarmNum": 2,
                "period": "06"
            },
            {
                "alarmNum": 1,
                "period": "07"
            },
            {
                "alarmNum": 1,
                "period": "08"
            },
            {
                "alarmNum": 3,
                "period": "09"
            },
            {
                "alarmNum": 1,
                "period": "10"
            }
        ],
        'THIS_WEEK': [
            {
                "alarmNum": 53,
                "period": "11"
            },
            {
                "alarmNum": 52,
                "period": "12"
            },
            {
                "alarmNum": 18,
                "period": "13"
            },
            {
                "alarmNum": 0,
                "period": "14"
            },
            {
                "alarmNum": 0,
                "period": "15"
            },
            {
                "alarmNum": 0,
                "period": "16"
            },
            {
                "alarmNum": 0,
                "period": "17"
            }
        ],
        'THIS_MONTH': [
            {
                "alarmNum": 4,
                "period": "01"
            },
            {
                "alarmNum": 23,
                "period": "02"
            },
            {
                "alarmNum": 3,
                "period": "03"
            },
            {
                "alarmNum": 2,
                "period": "04"
            },
            {
                "alarmNum": 21,
                "period": "05"
            },
            {
                "alarmNum": 5,
                "period": "06"
            },
            {
                "alarmNum": 13,
                "period": "07"
            },
            {
                "alarmNum": 10,
                "period": "08"
            },
            {
                "alarmNum": 43,
                "period": "09"
            },
            {
                "alarmNum": 53,
                "period": "10"
            },
            {
                "alarmNum": 53,
                "period": "11"
            },
            {
                "alarmNum": 52,
                "period": "12"
            },
            {
                "alarmNum": 18,
                "period": "13"
            },
            {
                "alarmNum": 0,
                "period": "14"
            },
            {
                "alarmNum": 0,
                "period": "15"
            },
            {
                "alarmNum": 0,
                "period": "16"
            },
            {
                "alarmNum": 0,
                "period": "17"
            },
            {
                "alarmNum": 0,
                "period": "18"
            },
            {
                "alarmNum": 0,
                "period": "19"
            },
            {
                "alarmNum": 0,
                "period": "20"
            },
            {
                "alarmNum": 0,
                "period": "21"
            },
            {
                "alarmNum": 0,
                "period": "22"
            },
            {
                "alarmNum": 0,
                "period": "23"
            },
            {
                "alarmNum": 0,
                "period": "24"
            },
            {
                "alarmNum": 0,
                "period": "25"
            },
            {
                "alarmNum": 0,
                "period": "26"
            },
            {
                "alarmNum": 0,
                "period": "27"
            },
            {
                "alarmNum": 0,
                "period": "28"
            },
            {
                "alarmNum": 0,
                "period": "29"
            },
            {
                "alarmNum": 0,
                "period": "30"
            }
        ],
        'THIS_YEAR': [
            {
                "alarmNum": 0,
                "period": "01"
            },
            {
                "alarmNum": 0,
                "period": "02"
            },
            {
                "alarmNum": 0,
                "period": "03"
            },
            {
                "alarmNum": 0,
                "period": "04"
            },
            {
                "alarmNum": 72,
                "period": "05"
            },
            {
                "alarmNum": 300,
                "period": "06"
            },
            {
                "alarmNum": 0,
                "period": "07"
            },
            {
                "alarmNum": 0,
                "period": "08"
            },
            {
                "alarmNum": 0,
                "period": "09"
            },
            {
                "alarmNum": 0,
                "period": "10"
            },
            {
                "alarmNum": 0,
                "period": "11"
            },
            {
                "alarmNum": 0,
                "period": "12"
            }
        ],
    }
    return mokeData[params.timeType];
};
//   安防监控报警记录
export const ecurityAlarmRecord = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        "total": 18,
        "pages": 1,
        "records": [
            {
                "id": "1668449535657062401",
                "code": "202306131045428930",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668449528824541186",
                "alarmTime": 1686624339000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686627942000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668446605612756993",
                "code": "202306131034037877",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "104.021252,30.565752",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668446600697032706",
                "alarmTime": 1686623627000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686627244000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668438235841376257",
                "code": "202306131000483229",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658389561295794177",
                "alarmTargetCode": "YQ-1F-JK-XZ071",
                "alarmTargetName": "水产1栋6号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668438228899803137",
                "alarmTime": 1686621613000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654112248718766082",
                "alarmEventName": "车辆违停—1号门至冻品区的通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686625248000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668434328352272385",
                "code": "202306130945165973",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668434324057305089",
                "alarmTime": 1686620714000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686624317000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668433984238989314",
                "code": "202306130943544067",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "104.021252,30.565752",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668433972977283074",
                "alarmTime": 1686620617000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686624235000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668424856514932738",
                "code": "202306130907388918",
                "alarmLevelId": "1546385498145112069",
                "alarmLevelCode": "four_level",
                "alarmLevelName": "四级",
                "alarmLevelSort": 4,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658391924534439937",
                "alarmTargetCode": "YQ-1F-JK-XZ070",
                "alarmTargetName": "水产6栋3号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668424848323457026",
                "alarmTime": 1686618439000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654119205181665281",
                "alarmEventName": "车辆违停—肉类1号厅门前通道",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686622058000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668419148159463425",
                "code": "202306130844576026",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668419135341670401",
                "alarmTime": 1686617091000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686620697000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668403958852431873",
                "code": "202306130744357058",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668403945367744513",
                "alarmTime": 1686613468000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686617076000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668388813057110017",
                "code": "202306130644241139",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668388798469320706",
                "alarmTime": 1686609850000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686613465000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668385371970416642",
                "code": "202306130630443883",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668385362050887682",
                "alarmTime": 1686609038000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686612644000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668373588438233089",
                "code": "202306130543559769",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668373576857759745",
                "alarmTime": 1686606228000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686609835000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668369207756140546",
                "code": "202306130526305542",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668369196356022274",
                "alarmTime": 1686605184000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686608791000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668358386560872450",
                "code": "202306130443309005",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668358371310383106",
                "alarmTime": 1686602604000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686606211000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668353279928643586",
                "code": "202306130423131125",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668353265386991617",
                "alarmTime": 1686601385000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686604993000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668343171530174466",
                "code": "202306130343031464",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668343161761640450",
                "alarmTime": 1686598979000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686602583000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668337699016224770",
                "code": "202306130321189755",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668337691676192770",
                "alarmTime": 1686597676000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686601278000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668328020391309313",
                "code": "202306130242508979",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668328006332002305",
                "alarmTime": 1686595365000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686598971000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668321052092084226",
                "code": "202306130215098396",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1658395917969027073",
                "alarmTargetCode": "HXGC-1F-JK-16#",
                "alarmTargetName": "海鲜一楼17号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668321038527705090",
                "alarmTime": 1686593701000,
                "area": "1547424028313075713-1641758559471480833-1641758667625803777",
                "areaName": "成农批-海鲜广场-1F",
                "alarmThreshold": "",
                "alarmEvent": "1654122486511513601",
                "alarmEventName": "交通拥堵—冻品A区前T字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686597309000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668312817289211905",
                "code": "202306130142267241",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668312807948496898",
                "alarmTime": 1686591742000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686595346000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            },
            {
                "id": "1668297657807876097",
                "code": "202306130042113389",
                "alarmLevelId": "1546385498145112067",
                "alarmLevelCode": "two_level",
                "alarmLevelName": "二级",
                "alarmLevelSort": 2,
                "alarmTypeId": "1546385459813367810",
                "alarmTypeCode": "SECURITY_MONITORING",
                "alarmTypeName": "安防监控报警",
                "alarmTargetKey": "1654047218275004417",
                "alarmTargetCode": "YQ-1F-JK-XZ061",
                "alarmTargetName": "停车区三1号",
                "alarmTargetTypeId": "1658362579627618305",
                "alarmTargetTypeName": "摄像机",
                "alarmTargetLongitude": "",
                "alarmTargetAddress": "",
                "businessType": "EMERGENCY_CENTER_ALARM",
                "businessKey": "1668297640040804354",
                "alarmTime": 1686588124000,
                "area": "1547424028313075713-1655742429770362881",
                "areaName": "成农批-园区",
                "alarmThreshold": "",
                "alarmEvent": "1654127844575490050",
                "alarmEventName": "交通拥堵—冻品B区域停车场十字路口",
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmConfirmedBy": null,
                "alarmConfirmedName": "",
                "alarmConfirmedTime": null,
                "estimateHandlerTime": null,
                "alarmHandlerBy": "",
                "alarmHandlerName": "",
                "alarmHandlerTime": null,
                "alarmHandlerResult": null,
                "alarmHandlerResultName": "",
                "alarmHandlerResultRemark": "",
                "timeoutEquipped": true,
                "timeoutProcessTime": 1686591732000,
                "timeoutProcessTimes": 60,
                "timeoutProcessTimesUnit": "MINUTE",
                "timeoutProcessTimesName": "",
                "alarmHandlerTimeoutStatus": null,
                "alarmHandlerTimeoutStatusName": "",
                "applicationId": null,
                "applicationCode": "SECURITY_MONITORING",
                "applicationName": "安防监控",
                "url": ""
            }
        ]
    }
    return mokeData;
};
//   安防监控报警趋势
export const ecurityAlarmTrend1 = <T extends Record<string, any>>(params: {
    type?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "alarmNum": 18,
            "alarmUnresolvedHandlerNum": 10,
            "alarmTimeoutNum": 8
        },
        'THIS_WEEK': {
            "alarmNum": 123,
            "alarmUnresolvedHandlerNum": 23,
            "alarmTimeoutNum": 100
        },
        'THIS_MONTH': {
            "alarmNum": 300,
            "alarmUnresolvedHandlerNum": 10,
            "alarmTimeoutNum": 290
        },
        'THIS_YEAR': {
            "alarmNum": 372,
            "alarmUnresolvedHandlerNum": 22,
            "alarmTimeoutNum": 350
        },
    }
    return mokeData[params.type];
};
//   安防监控报警趋势
export const ecurityAlarmTop5 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                alarmNum: 7,
                chainRatio: 15,
                name: '明火',
                ratio: 10
            },
            {
                alarmNum: 4,
                chainRatio: 20,
                name: '交通拥堵',
                ratio: 10
            },
            {
                alarmNum: 3,
                chainRatio: 18,
                name: '环境卫生',
                ratio: 10
            },
            {
                alarmNum: 3,
                chainRatio: 15,
                name: '违章占道',
                ratio: 10
            },
            {
                alarmNum: 1,
                chainRatio: 15,
                name: '打架斗殴',
                ratio: 10
            },
        ],
        'THIS_WEEK': [
            {
                alarmNum: 59,
                chainRatio: 30,
                name: '明火',
                ratio: 30
            },
            {
                alarmNum: 51,
                chainRatio: 29,
                name: '交通拥堵',
                ratio: 18
            },
            {
                alarmNum: 41,
                chainRatio: 21,
                name: '环境卫生',
                ratio: 25
            },
            {
                alarmNum: 32,
                chainRatio: 19,
                name: '违章占道',
                ratio: 15
            },
            {
                alarmNum: 20,
                chainRatio: 17,
                name: '打架斗殴',
                ratio: 11
            },
        ],
        'THIS_MONTH': [
            {
                alarmNum: 108,
                chainRatio: 45,
                name: '明火',
                ratio: 11
            },
            {
                alarmNum: 69,
                chainRatio: 22,
                name: '交通拥堵',
                ratio: 35
            },
            {
                alarmNum: 58,
                chainRatio: 30,
                name: '环境卫生',
                ratio: 18
            },
            {
                alarmNum: 48,
                chainRatio: 25,
                name: '违章占道',
                ratio: 19
            },
            {
                alarmNum: 38,
                chainRatio: 20,
                name: '打架斗殴',
                ratio: 9
            },
        ],
        'THIS_YEAR': [
            {
                alarmNum: 214,
                chainRatio: 28,
                name: '明火',
                ratio: 25
            },
            {
                alarmNum: 182,
                chainRatio: 34,
                name: '交通拥堵',
                ratio: 21
            },
            {
                alarmNum: 150,
                chainRatio: 28,
                name: '环境卫生',
                ratio: 14
            },
            {
                alarmNum: 104,
                chainRatio: 29,
                name: '违章占道',
                ratio: 10
            },
            {
                alarmNum: 70,
                chainRatio: 11,
                name: '打架斗殴',
                ratio: 15
            },
        ],
    }
    return mokeData[params.timeType];
};
//   安防监控巡逻异常数统计
export const ecurityPatrolAnomaly = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = [
        {
            time: moment().format('MM-DD'),
            patrol: '肉类交易区',
            reportPerson: '管理员',
            photos: ''
        },
        {
            time: moment().format('MM-DD'),
            patrol: '蔬菜交易区',
            reportPerson: '管理员',
            photos: ''
        },
        {
            time: moment().format('MM-DD'),
            patrol: '海鲜交易区',
            reportPerson: '管理员',
            photos: ''
        },
        {
            time: moment().format('MM-DD'),
            patrol: '海鲜交易区',
            reportPerson: '管理员',
            photos: ''
        },
        {
            time: moment().format('MM-DD'),
            patrol: '蔬菜交易区',
            reportPerson: '管理员',
            photos: ''
        },
    ]
    return mokeData
};
//   门禁管理设备实时状态
export const mockAccessControl = <T extends Record<string, any>>(): any => {
    let mokeData = {
        data: [
            {
                label: '开启(80%)',
                color: '#19F8F7',
                value: 80
            },
            {
                label: '关闭(10%)',
                color: '#FFC700',
                value: 10
            },
            {
                label: '离线(7%)',
                color: '#46647E',
                value: 7
            },
        ],
        total: 100
    }
    return mokeData
};
//   门禁管理异常事件top5
export const mockAlarmTop5 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                value: 50,
                chainRatio: 15,
                name: '早稻鸣器鸣叫',
                ringRatio: 10
            },
            {
                value: 45,
                chainRatio: 20,
                name: '读卡不开门',
                ringRatio: 10
            },
            {
                value: 42,
                chainRatio: 18,
                name: '电锁故障',
                ringRatio: 10
            },
            {
                value: 32,
                chainRatio: 15,
                name: 'ic无法读卡',
                ringRatio: 10
            },
            {
                value: 25,
                chainRatio: 15,
                name: '通讯故障',
                ringRatio: 10
            },
        ],
        'THIS_WEEK': [
            {
                value: 59,
                chainRatio: 30,
                name: '早稻鸣器鸣叫',
                ringRatio: 30
            },
            {
                value: 51,
                chainRatio: 29,
                name: '读卡不开门',
                ringRatio: 18
            },
            {
                value: 41,
                chainRatio: 21,
                name: '电锁故障',
                ringRatio: 25
            },
            {
                value: 32,
                chainRatio: 19,
                name: 'ic无法读卡',
                ringRatio: 15
            },
            {
                value: 20,
                chainRatio: 17,
                name: '通讯故障',
                ringRatio: 11
            },
        ],
        'THIS_MONTH': [
            {
                value: 108,
                chainRatio: 45,
                name: '早稻鸣器鸣叫',
                ringRatio: 11
            },
            {
                value: 69,
                chainRatio: 22,
                name: '读卡不开门',
                ringRatio: 35
            },
            {
                value: 58,
                chainRatio: 30,
                name: '电锁故障',
                ringRatio: 18
            },
            {
                value: 48,
                chainRatio: 25,
                name: 'ic无法读卡',
                ringRatio: 19
            },
            {
                value: 38,
                chainRatio: 20,
                name: '通讯故障',
                ringRatio: 9
            },
        ],
        'THIS_YEAR': [
            {
                value: 214,
                chainRatio: 28,
                name: '早稻鸣器鸣叫',
                ringRatio: 25
            },
            {
                value: 182,
                chainRatio: 34,
                name: '读卡不开门',
                ringRatio: 21
            },
            {
                value: 150,
                chainRatio: 28,
                name: '电锁故障',
                ringRatio: 14
            },
            {
                value: 104,
                chainRatio: 29,
                name: 'ic无法读卡',
                ringRatio: 10
            },
            {
                value: 70,
                chainRatio: 11,
                name: '通讯故障',
                ringRatio: 15
            },
        ],
    }
    return mokeData[params.timeType];
};
// 空调管理设备实时数据
export const mockRealTimeDeviceData = <T extends Record<string, any>>(): any => {
    let mokeData = {
        deviceStatusNums: [
            {
                name: 'NORMAL',
                num: 90,
            },
            {
                name: 'TROUBLE',
                num: 15,
            },
            {
                name: 'OFFLINE',
                num: 7,
            },
            {
                name: 'ALARM',
                num: 3,
            },
        ],
        deviceNum: 115
    }
    return mokeData
};
//    空调管理设备报警趋势
export const DeviceAlarmTrend = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [0, 0, 0, 0, 0, 0, 2, 4, 2, 3, 5, 4, 1, 2, 6, 7, 2],
        'THIS_WEEK': [10, 15, 17, 10, 6, 5, 8],
        'THIS_MONTH': [11, 12, 14, 25, 18, 14, 23, 14, 10, 5, 2, 6, 1, 7, 9, 25],
        'THIS_YEAR': [102, 140, 182, 147, 95, 77],
    }
    return mokeData[params.timeType];
};
//    空调管理设备报警趋势
export const DeviceAlarmTrend1 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "alarmNum": 24,
            "chainRatio": 1,
            "alarmStatusStatistics": [
                {
                    "alarmStatus": "ALARM_UN_CONFIRMED",
                    "alarmStatusName": "待接收",
                    "alarmNum": 5
                },
                {
                    "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                    "alarmStatusName": "处理中",
                    "alarmNum": 8
                },
                {
                    "alarmStatus": "ALARM_SUSPEND",
                    "alarmStatusName": "已挂起",
                    "alarmNum": 3
                },
                {
                    "alarmStatus": "ALARM_HANDLER",
                    "alarmStatusName": "已处理",
                    "alarmNum": 8
                }
            ]
        },
        'THIS_WEEK': {
            "alarmNum": 66,
            "chainRatio": 2,
            "alarmStatusStatistics": [
                {
                    "alarmStatus": "ALARM_UN_CONFIRMED",
                    "alarmStatusName": "待接收",
                    "alarmNum": 5
                },
                {
                    "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                    "alarmStatusName": "处理中",
                    "alarmNum": 18
                },
                {
                    "alarmStatus": "ALARM_SUSPEND",
                    "alarmStatusName": "已挂起",
                    "alarmNum": 4
                },
                {
                    "alarmStatus": "ALARM_HANDLER",
                    "alarmStatusName": "已处理",
                    "alarmNum": 39
                }
            ]
        },
        'THIS_MONTH': {
            "alarmNum": 176,
            "chainRatio": 8,
            "alarmStatusStatistics": [
                {
                    "alarmStatus": "ALARM_UN_CONFIRMED",
                    "alarmStatusName": "待接收",
                    "alarmNum": 15
                },
                {
                    "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                    "alarmStatusName": "处理中",
                    "alarmNum": 59
                },
                {
                    "alarmStatus": "ALARM_SUSPEND",
                    "alarmStatusName": "已挂起",
                    "alarmNum": 14
                },
                {
                    "alarmStatus": "ALARM_HANDLER",
                    "alarmStatusName": "已处理",
                    "alarmNum": 88
                }
            ]
        },
        'THIS_YEAR': {
            "alarmNum": 655,
            "chainRatio": 12,
            "alarmStatusStatistics": [
                {
                    "alarmStatus": "ALARM_UN_CONFIRMED",
                    "alarmStatusName": "待接收",
                    "alarmNum": 56
                },
                {
                    "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                    "alarmStatusName": "处理中",
                    "alarmNum": 102
                },
                {
                    "alarmStatus": "ALARM_SUSPEND",
                    "alarmStatusName": "已挂起",
                    "alarmNum": 67
                },
                {
                    "alarmStatus": "ALARM_HANDLER",
                    "alarmStatusName": "已处理",
                    "alarmNum": 430
                }
            ]
        },
    }
    return mokeData[params.timeType];
};
//    空调管理设备报警率
export const EquipmentAlarmRate = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            deviceTotal: 115,
            alarmNum: 3,
            chainRatio: 0.02,
            proportion: 0.02,
        },
        'THIS_WEEK': {
            deviceTotal: 98,
            alarmNum: 12,
            chainRatio: 0.12,
            proportion: 0.12,
        },
        'THIS_MONTH': {
            deviceTotal: 109,
            alarmNum: 18,
            chainRatio: 0.16,
            proportion: 0.16,
        },
        'THIS_YEAR': {
            deviceTotal: 218,
            alarmNum: 35,
            chainRatio: 0.16,
            proportion: 0.16,
        },
    }
    return mokeData[params.timeType];
};
// 空调管理空调类型分布
export const mockAirConditioningDistribution = <T extends Record<string, any>>(): any => {
    let mokeData = {
        deviceGenreNums: [
            {
                genreName: '立柜式',
                num: 10,
            },
            {
                genreName: '外挂式',
                num: 100,
            },
            {
                genreName: '中央空调',
                num: 3,
            },
            {
                genreName: '窗式空调',
                num: 2,
            },
        ],
        deviceNum: 115
    }
    return mokeData
};
//   空调管理报警事件top5
export const mockAlarmEventTop5 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                alarmNum: 50,
                ratio: 15,
                name: '室外热敏电流',
                ringRatio: 10
            },
            {
                alarmNum: 45,
                ratio: 20,
                name: '高压保护',
                ringRatio: 10
            },
            {
                alarmNum: 42,
                ratio: 18,
                name: '压缩机过热',
                ringRatio: 10
            },
            {
                alarmNum: 32,
                ratio: 15,
                name: '相序错误',
                ringRatio: 10
            },
            {
                alarmNum: 25,
                ratio: 15,
                name: '面板通信错误',
                ringRatio: 10
            },
        ],
        'THIS_WEEK': [
            {
                alarmNum: 59,
                ratio: 30,
                name: '室外热敏电流',
                ringRatio: 30
            },
            {
                alarmNum: 51,
                ratio: 29,
                name: '高压保护',
                ringRatio: 18
            },
            {
                alarmNum: 41,
                ratio: 21,
                name: '压缩机过热',
                ringRatio: 25
            },
            {
                alarmNum: 32,
                ratio: 19,
                name: '相序错误',
                ringRatio: 15
            },
            {
                alarmNum: 20,
                ratio: 17,
                name: '面板通信错误',
                ringRatio: 11
            },
        ],
        'THIS_MONTH': [
            {
                alarmNum: 108,
                ratio: 45,
                name: '室外热敏电流',
                ringRatio: 11
            },
            {
                alarmNum: 69,
                ratio: 22,
                name: '高压保护',
                ringRatio: 35
            },
            {
                alarmNum: 58,
                ratio: 30,
                name: '压缩机过热',
                ringRatio: 18
            },
            {
                alarmNum: 48,
                ratio: 25,
                name: '相序错误',
                ringRatio: 19
            },
            {
                alarmNum: 38,
                ratio: 20,
                name: '面板通信错误',
                ringRatio: 9
            },
        ],
        'THIS_YEAR': [
            {
                alarmNum: 214,
                ratio: 28,
                name: '室外热敏电流',
                ringRatio: 25
            },
            {
                alarmNum: 182,
                ratio: 34,
                name: '高压保护',
                ringRatio: 21
            },
            {
                alarmNum: 150,
                ratio: 28,
                name: '压缩机过热',
                ringRatio: 14
            },
            {
                alarmNum: 104,
                ratio: 29,
                name: '相序错误',
                ringRatio: 10
            },
            {
                alarmNum: 70,
                ratio: 11,
                name: '面板通信错误',
                ringRatio: 15
            },
        ],
    }
    return mokeData[params.timeType];
};
//   空调管理报警事件top5
export const mockRealTimeAlarmData = <T extends Record<string, any>>(): any => {
    let mokeData = {
        records:
            [
                {
                    alarmTime: moment().format("YYYY-MM-DD"),
                    alarmTargetName: '空调1',
                    alarmEventName: '压缩机电流'
                },
                {
                    alarmTime: moment().format("YYYY-MM-DD"),
                    alarmTargetName: '空调2',
                    alarmEventName: '相序错误'
                },
                {
                    alarmTime: moment().format("YYYY-MM-DD"),
                    alarmTargetName: '空调3',
                    alarmEventName: '高压保护'
                },
                {
                    alarmTime: moment().format("YYYY-MM-DD"),
                    alarmTargetName: '空调4',
                    alarmEventName: '压缩机过热'
                },
                {
                    alarmTime: moment().format("YYYY-MM-DD"),
                    alarmTargetName: '空调5',
                    alarmEventName: '压缩机超负荷'
                },
            ]
    }
    return mokeData
};
// 给排水管理设备类型分布
export const mockEquipmentTypeDistribution = <T extends Record<string, any>>(): any => {
    let mokeData = {
        deviceGenreNums: [
            {
                genreName: '生活水箱',
                num: 10,
            },
            {
                genreName: '给水泵',
                num: 100,
            },
            {
                genreName: '集水井',
                num: 3,
            },
            {
                genreName: '潜污泵',
                num: 2,
            },
        ],
        deviceStatusNums: [
            {
                name: 'TROUBLE',
                deviceNum: 115,
                num: 15,

            }
        ],
        deviceNum: 115
    }
    return mokeData
};
//   空调管理设备类型报警top5
export const mockDeviceTypeAlarmTop5 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                alarmNum: 50,
                ratio: 15,
                name: '生活水箱',
                chainRatio: 10
            },
            {
                alarmNum: 45,
                ratio: 20,
                name: '给水泵',
                chainRatio: 10
            },
            {
                alarmNum: 42,
                ratio: 18,
                name: '集水井',
                chainRatio: 10
            },
            {
                alarmNum: 32,
                ratio: 15,
                name: '潜污泵',
                chainRatio: 10
            },
            {
                alarmNum: 25,
                ratio: 15,
                name: '变频泵',
                chainRatio: 10
            },
        ],
        'THIS_WEEK': [
            {
                alarmNum: 59,
                ratio: 30,
                name: '生活水箱',
                chainRatio: 30
            },
            {
                alarmNum: 51,
                ratio: 29,
                name: '给水泵',
                chainRatio: 18
            },
            {
                alarmNum: 41,
                ratio: 21,
                name: '集水井',
                chainRatio: 25
            },
            {
                alarmNum: 32,
                ratio: 19,
                name: '潜污泵',
                chainRatio: 15
            },
            {
                alarmNum: 20,
                ratio: 17,
                name: '变频泵',
                chainRatio: 11
            },
        ],
        'THIS_MONTH': [
            {
                alarmNum: 108,
                ratio: 45,
                name: '生活水箱',
                chainRatio: 11
            },
            {
                alarmNum: 69,
                ratio: 22,
                name: '给水泵',
                chainRatio: 35
            },
            {
                alarmNum: 58,
                ratio: 30,
                name: '集水井',
                chainRatio: 18
            },
            {
                alarmNum: 48,
                ratio: 25,
                name: '潜污泵',
                chainRatio: 19
            },
            {
                alarmNum: 38,
                ratio: 20,
                name: '变频泵',
                chainRatio: 9
            },
        ],
        'THIS_YEAR': [
            {
                alarmNum: 214,
                ratio: 28,
                name: '生活水箱',
                chainRatio: 25
            },
            {
                alarmNum: 182,
                ratio: 34,
                name: '给水泵',
                chainRatio: 21
            },
            {
                alarmNum: 150,
                ratio: 28,
                name: '集水井',
                chainRatio: 14
            },
            {
                alarmNum: 104,
                ratio: 29,
                name: '潜污泵',
                chainRatio: 10
            },
            {
                alarmNum: 70,
                ratio: 11,
                name: '变频泵',
                chainRatio: 15
            },
        ],
    }
    return mokeData[params.timeType];
};
//   排风报警区域top5
export const mockAirExhaustTypeAlarmTop5 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                alarmNum: 50,
                ratio: 15,
                name: '门诊大楼',
                chainRatio: 10
            },
            {
                alarmNum: 45,
                ratio: 20,
                name: '住院大楼',
                chainRatio: 10
            },
            {
                alarmNum: 42,
                ratio: 18,
                name: '行政大楼',
                chainRatio: 10
            },
            {
                alarmNum: 32,
                ratio: 15,
                name: '地下室A区',
                chainRatio: 10
            },
            {
                alarmNum: 25,
                ratio: 15,
                name: '地下室B区',
                chainRatio: 10
            },
        ],
        'THIS_WEEK': [
            {
                alarmNum: 59,
                ratio: 30,
                name: '门诊大楼',
                chainRatio: 30
            },
            {
                alarmNum: 51,
                ratio: 29,
                name: '住院大楼',
                chainRatio: 18
            },
            {
                alarmNum: 41,
                ratio: 21,
                name: '行政大楼',
                chainRatio: 25
            },
            {
                alarmNum: 32,
                ratio: 19,
                name: '地下室A区',
                chainRatio: 15
            },
            {
                alarmNum: 20,
                ratio: 17,
                name: '地下室B区',
                chainRatio: 11
            },
        ],
        'THIS_MONTH': [
            {
                alarmNum: 108,
                ratio: 45,
                name: '门诊大楼',
                chainRatio: 11
            },
            {
                alarmNum: 69,
                ratio: 22,
                name: '住院大楼',
                chainRatio: 35
            },
            {
                alarmNum: 58,
                ratio: 30,
                name: '行政大楼',
                chainRatio: 18
            },
            {
                alarmNum: 48,
                ratio: 25,
                name: '地下室A区',
                chainRatio: 19
            },
            {
                alarmNum: 38,
                ratio: 20,
                name: '地下室B区',
                chainRatio: 9
            },
        ],
        'THIS_YEAR': [
            {
                alarmNum: 214,
                ratio: 28,
                name: '门诊大楼',
                chainRatio: 25
            },
            {
                alarmNum: 182,
                ratio: 34,
                name: '住院大楼',
                chainRatio: 21
            },
            {
                alarmNum: 150,
                ratio: 28,
                name: '行政大楼',
                chainRatio: 14
            },
            {
                alarmNum: 104,
                ratio: 29,
                name: '地下室A区',
                chainRatio: 10
            },
            {
                alarmNum: 70,
                ratio: 11,
                name: '地下室B区',
                chainRatio: 15
            },
        ],
    }
    return mokeData[params.timeType];
};
// 给排风管理设备类型分布
export const mockAirExhaustTypeDistribution = <T extends Record<string, any>>(): any => {
    let mokeData = {
        deviceGenreNums: [
            {
                genreName: '自然排风',
                num: 10,
            },
            {
                genreName: '机械排风',
                num: 100,
            },
            {
                genreName: '混合排风',
                num: 3,
            },
            {
                genreName: '碱性气体排风系统',
                num: 2,
            },
        ],
        deviceStatusNums: [
            {
                name: 'TROUBLE',
                deviceNum: 115,
                num: 15,

            }
        ],
        deviceNum: 115
    }
    return mokeData
};
//    门禁管理人流通行趋势
export const TrendPedestrianFlow = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [0, 0, 0, 0, 0, 0, 5, 4, 6, 8, 10, 11, 10, 4, 3],
        'THIS_WEEK': [28, 46, 12, 48, 36, 41, 22],
        'THIS_MONTH': [25, 45, 36, 14, 28, 29, 63, 52, 14, 28, 75, 36, 15, 24, 29, 36],
        'THIS_YEAR': [108, 211, 154, 203, 214, 301],
    }
    return mokeData[params.timeType];
};
//    门禁管理通行分析
export const TrafficAnalysis = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            arr: [
                {
                    label: '正常通行',
                    color: '#328BF7',
                    value: 58
                },
                {
                    label: '异常通行',
                    color: '#19F8F7',
                    value: 3
                },
            ],
            total: 61
        },
        'THIS_WEEK': {
            arr: [
                {
                    label: '正常通行',
                    color: '#328BF7',
                    value: 354
                },
                {
                    label: '异常通行',
                    color: '#19F8F7',
                    value: 18
                },
            ],
            total: 372
        },
        'THIS_MONTH': {
            arr: [
                {
                    label: '正常通行',
                    color: '#328BF7',
                    value: 2412
                },
                {
                    label: '异常通行',
                    color: '#19F8F7',
                    value: 58
                },
            ],
            total: 2470
        },
        'THIS_YEAR': {
            arr: [
                {
                    label: '正常通行',
                    color: '#328BF7',
                    value: 9712
                },
                {
                    label: '异常通行',
                    color: '#19F8F7',
                    value: 182
                },
            ],
            total: 1153
        },
    }
    return mokeData[params.timeType];
};
//    门禁管理通行分析
export const AccessControlData = <T extends Record<string, any>>(): any => {
    let mokeData = [
        {
            eventTime: moment().format('MM:DD'),
            doorName: '12F大门',
            eventWay: '二维码'
        },
        {
            eventTime: moment().format('MM:DD'),
            doorName: '12F大门',
            eventWay: '密码开门'
        },
        {
            eventTime: moment().format('MM:DD'),
            doorName: '2F大门',
            eventWay: '指纹开门'
        },
        {
            eventTime: moment().format('MM:DD'),
            doorName: '2F大门',
            eventWay: '二维码'
        },
        {
            eventTime: moment().format('MM:DD'),
            doorName: '12F大门',
            eventWay: '密码开门'
        },
    ]
    return mokeData
};
//    停车管理车流趋势
export const TrafficFlowTrend = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "ringRatio": 0,
            "xdata": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
                "19",
                "20",
                "21",
                "22",
                "23",
                "24"
            ],
            "series": [
                {
                    "value": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        10,
                        18,
                        19,
                        25,
                        28,
                        30,
                        10,
                        25,
                        19,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使入车辆",
                    "total": 184
                },
                {
                    "value": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        4,
                        9,
                        12,
                        2,
                        10,
                        6,
                        7,
                        3,
                        18,
                        15,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使出车辆",
                    "total": 86
                }
            ]
        },
        'THIS_WEEK': {
            "ringRatio": 0,
            "xdata": [
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六",
                "周天"
            ],
            "series": [
                {
                    "value": [
                        45,
                        63,
                        45,
                        32,
                        42,
                        39,
                        98
                    ],
                    "name": "使入车辆",
                    "total": 363
                },
                {
                    "value": [
                        38,
                        52,
                        18,
                        28,
                        29,
                        48,
                        60
                    ],
                    "name": "使出车辆",
                    "total": 273
                }
            ]
        },
        'THIS_MONTH': {
            "ringRatio": 0,
            "xdata": [
                "6-1",
                "6-2",
                "6-3",
                "6-4",
                "6-5",
                "6-6",
                "6-7",
                "6-8",
                "6-9",
                "6-10",
                "6-11",
                "6-12",
                "6-13",
                "6-14",
                "6-15",
                "6-16",
                "6-17",
                "6-18",
                "6-19",
                "6-20",
                "6-21",
                "6-22",
                "6-23",
                "6-24",
                "6-25",
                "6-26",
                "6-27",
                "6-28",
                "6-29",
                "6-30"
            ],
            "series": [
                {
                    "value": [
                        45,
                        36,
                        45,
                        18,
                        39,
                        45,
                        39,
                        78,
                        42,
                        39,
                        58,
                        51,
                        98,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使出车辆",
                    "total": 633
                },
                {
                    "value": [
                        42,
                        38,
                        69,
                        77,
                        69,
                        87,
                        39,
                        89,
                        47,
                        39,
                        78,
                        98,
                        45,
                        42,
                        36,
                        18,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使入车辆",
                    "total": 913
                }
            ]
        },
        'THIS_YEAR': {
            "ringRatio": 0,
            "xdata": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12"
            ],
            "series": [
                {
                    "value": [
                        450,
                        380,
                        280,
                        410,
                        350,
                        644,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使入车辆",
                    "total": 2514
                },
                {
                    "value": [
                        380,
                        441,
                        280,
                        460,
                        290,
                        545,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "使出车辆",
                    "total": 2396
                }
            ]
        },
    }
    return mokeData[params.timeType];
};
//    停车管理滞留车辆分析
export const AnalysisStrandedVehicles = <T extends Record<string, any>>(): any => {
    let mokeData = {
        "ringRatio": 0,
        "xdata": [
            "1",
            "2",
            "3",
            "4",
            "5"
        ],
        "series": [
            {
                "value": [
                    0,
                    15,
                    28,
                    36,
                    27
                ],
                "name": "滞留车辆分布",
                "total": 20
            },
            {
                "value": [
                    0,
                    38,
                    26,
                    19,
                    15
                ],
                "name": "滞留车辆分布百分比",
                "total": 0
            }
        ]
    }
    return mokeData
};
//    停车管理收费总览
//    停车管理车流趋势
export const FeeOverview = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "freeAmount": 810,
            "receivableAmount": 835,
            "discountAmount": 25,
            "freeAmountRingRatio": 5,
            "receivableAmountRingRatio": -1,
            "discountAmountRingRatio": -3
        },
        'THIS_WEEK': {
            "freeAmount": 2511,
            "receivableAmount": 2400,
            "discountAmount": 111,
            "freeAmountRingRatio": 2,
            "receivableAmountRingRatio": -2,
            "discountAmountRingRatio": -3
        },
        'THIS_MONTH': {
            "freeAmount": 14125,
            "receivableAmount": 14000,
            "discountAmount": 125,
            "freeAmountRingRatio": 2,
            "receivableAmountRingRatio": -3,
            "discountAmountRingRatio": -2
        },
        'THIS_YEAR': {
            "freeAmount": 105500,
            "receivableAmount": 105000,
            "discountAmount": 500,
            "freeAmountRingRatio": 3,
            "receivableAmountRingRatio": -5,
            "discountAmountRingRatio": -3
        },
    }
    return mokeData[params.timeType];
};
//    停车管理收费趋势
export const ChargingTrends = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': [
            {
                "name": "现金",
                "code": "0",
                "freeAmount": 90
            },
            {
                "name": "支付宝",
                "code": "1",
                "freeAmount": 45
            },
            {
                "name": "微信",
                "code": "2",
                "freeAmount": 175
            },
            {
                "name": "银联",
                "code": "3",
                "freeAmount": 320
            },
            {
                "name": "其他",
                "code": "4",
                "freeAmount": 180
            }
        ],
        'THIS_WEEK': [
            {
                "name": "现金",
                "code": "0",
                "freeAmount": 650
            },
            {
                "name": "支付宝",
                "code": "1",
                "freeAmount": 421
            },
            {
                "name": "微信",
                "code": "2",
                "freeAmount": 328
            },
            {
                "name": "银联",
                "code": "3",
                "freeAmount": 472
            },
            {
                "name": "其他",
                "code": "4",
                "freeAmount": 680
            }
        ],
        'THIS_MONTH': [
            {
                "name": "现金",
                "code": "0",
                "freeAmount": 1890
            },
            {
                "name": "支付宝",
                "code": "1",
                "freeAmount": 3854
            },
            {
                "name": "微信",
                "code": "2",
                "freeAmount": 4821
            },
            {
                "name": "银联",
                "code": "3",
                "freeAmount": 2580
            },
            {
                "name": "其他",
                "code": "4",
                "freeAmount": 980
            }
        ],
        'THIS_YEAR': [
            {
                "name": "现金",
                "code": "0",
                "freeAmount": 4570
            },
            {
                "name": "支付宝",
                "code": "1",
                "freeAmount": 39854
            },
            {
                "name": "微信",
                "code": "2",
                "freeAmount": 48951
            },
            {
                "name": "银联",
                "code": "3",
                "freeAmount": 6258
            },
            {
                "name": "其他",
                "code": "4",
                "freeAmount": 5895
            }
        ],
    }
    return mokeData[params.timeType];
};
//    停车管理支付方式占比
export const PaymentProportion = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): any => {
    let mokeData = {
        'TODAY': {
            "ringRatio": 0,
            "xdata": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
                "19",
                "20",
                "21",
                "22",
                "23",
                "24"
            ],
            "series": [
                {
                    "value": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        12,
                        20,
                        32,
                        19,
                        25,
                        35,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "收费趋势",
                    "total": 143
                }
            ]
        },
        'THIS_WEEK': {
            "ringRatio": 0,
            "xdata": [
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六",
                "周天"
            ],
            "series": [
                {
                    "value": [
                        195,
                        158,
                        201,
                        198,
                        452,
                        152,
                        258
                    ],
                    "name": "收费趋势",
                    "total": 1614
                }
            ]
        },
        'THIS_MONTH': {
            "ringRatio": 0,
            "xdata": [
                "6-1",
                "6-2",
                "6-3",
                "6-4",
                "6-5",
                "6-6",
                "6-7",
                "6-8",
                "6-9",
                "6-10",
                "6-11",
                "6-12",
                "6-13",
                "6-14",
                "6-15",
                "6-16",
                "6-17",
                "6-18",
                "6-19",
                "6-20",
                "6-21",
                "6-22",
                "6-23",
                "6-24",
                "6-25",
                "6-26",
                "6-27",
                "6-28",
                "6-29",
                "6-30"
            ],
            "series": [
                {
                    "value": [
                        158,
                        250,
                        198,
                        284,
                        185,
                        241,
                        421,
                        187,
                        265,
                        175,
                        269,
                        287,
                        369,
                        351,
                        254,
                        157,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "收费趋势",
                    "total": 4051
                }
            ]
        },
        'THIS_YEAR': {
            "ringRatio": 0,
            "xdata": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12"
            ],
            "series": [
                {
                    "value": [
                        1584,
                        2698,
                        1482,
                        3654,
                        2984,
                        3621,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "name": "收费趋势",
                    "total": 16023
                }
            ]
        },
    }
    return mokeData[params.timeType];
};