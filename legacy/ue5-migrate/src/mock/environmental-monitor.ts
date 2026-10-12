
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

// 报警级别分布
export const mockAlarmLevel = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmLevelType[] => {
    let mokeData = {
        'TODAY': [
            {
                "code": "one_level",
                "name": "一级",
                "alarmNum": 38,
                "chainRatio": 100.0
            },
            {
                "code": "two_level",
                "name": "二级",
                "alarmNum": 56,
                "chainRatio": 100.0
            },
            {
                "code": "three_level",
                "name": "三级",
                "alarmNum": 42,
                "chainRatio": 100.0
            },
            {
                "code": "four_level",
                "name": "四级",
                "alarmNum": 46,
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
                "alarmNum": 172,
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
                "alarmNum": 0,
                "period": "08"
            }, {
                "alarmNum": 0,
                "period": "09"
            }, {
                "alarmNum": 10,
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
                "alarmNum": 0,
                "period": "06"
            }, {
                "alarmNum": 172,
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
                "alarmNum": 172,
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
                "alarmNum": 30,
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
                "alarmNum": 42,
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
            "genreName": "新风机组",
            "num": 15,
            "proportion": 0.50
        }, {
            "genre": "1641634809765769218",
            "genreName": "温湿度",
            "num": 10,
            "proportion": 0.50
        },{
            "genre": "1641634809765769218",
            "genreName": "烟感",
            "num": 5,
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
            "num": 1
        }, {
            "name": "TROUBLE",
            "num": 2
        }, {
            "name": "ALARM",
            "num": 2
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
                "name": "南区",
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
                "name": "1号门",
                "alarmNum": 0,
                "chainRatio": 0.0,
                "ratio": 0.0
            }, {
                "id": "1651153448948805634",
                "name": "2号门",
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

// 报警处理排名 楼层
export const mockStatisticsAreaTopFloor = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmAreaTop[] => {
    let mokeData = {
        'TODAY': [
            {
                "id": "1641758559471480833",
                "name": "2F-烟感-001",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-喷淋设备-003",
                "alarmNum": 11,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "4F-温感-003",
                "alarmNum": 8,
                "chainRatio": 3.0,
                "ratio": 1.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-温感-004",
                "alarmNum": 5,
                "chainRatio": 4.0,
                "ratio": 2.0
            }, {
                "id": "1651157867392217090",
                "name": "4F-烟感-004",
                "alarmNum": 4,
                "chainRatio": 1.0,
                "ratio": 1.0
            }
        ],
        'THIS_WEEK': [
            {
                "id": "1641758559471480833",
                "name": "3F-烟感-004",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "6F-烟感-004",
                "alarmNum": 98,
                "chainRatio": 65.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "1F-气体灭火器-003",
                "alarmNum": 46,
                "chainRatio": 38.0,
                "ratio": 24.0
            }, {
                "id": "1651153448948805634",
                "name": "3F-温感-005",
                "alarmNum": 38,
                "chainRatio": 28.0,
                "ratio": 18.0
            }, {
                "id": "1651157867392217090",
                "name": "3F-排烟风机-008",
                "alarmNum": 28,
                "chainRatio": 4.0,
                "ratio": 1.0
            }
        ],
        'THIS_MONTH': [
            {
                "id": "1641758559471480833",
                "name": "2F-排烟风机-005",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-喷淋设备-003",
                "alarmNum": 146,
                "chainRatio": 45.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "3F-排烟风机-008",
                "alarmNum": 120,
                "chainRatio": 41.0,
                "ratio": 18.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-排烟风机-005",
                "alarmNum": 104,
                "chainRatio": 38.0,
                "ratio": 7.0
            }, {
                "id": "1651157867392217090",
                "name": "6F-烟感-004",
                "alarmNum": 45,
                "chainRatio": 28.0,
                "ratio": 7.0
            }
        ],
        'THIS_YEAR': [
            {
                "id": "1641758559471480833",
                "name": "2F-排烟风机-005",
                "alarmNum": 358,
                "chainRatio": 60.0,
                "ratio": 47.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-气体灭火器-003",
                "alarmNum": 241,
                "chainRatio": 50.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "2F-温感-004",
                "alarmNum": 200,
                "chainRatio": 28.0,
                "ratio": 5.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-温感-004",
                "alarmNum": 154,
                "chainRatio": 20.0,
                "ratio": 12.0
            }, {
                "id": "1651157867392217090",
                "name": "4F-烟感-004",
                "alarmNum": 121,
                "chainRatio": 14.0,
                "ratio": 8.0
            }
        ],
    }
    return mokeData[params.timeType];
};
// 报警处理排名 楼层
export const mockStatisticsAreaTopFloor1 = <T extends Record<string, any>>(params: {
    timeType?: TimeType;
}): AlarmAreaTop[] => {
    let mokeData = {
        'TODAY': [
            {
                "id": "1641758559471480833",
                "name": "2F-视频监控-001",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-UPS-003",
                "alarmNum": 11,
                "chainRatio": 100.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "4F-漏水监控设备-003",
                "alarmNum": 8,
                "chainRatio": 3.0,
                "ratio": 1.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-温湿度监控设备-004",
                "alarmNum": 5,
                "chainRatio": 4.0,
                "ratio": 2.0
            }, {
                "id": "1651157867392217090",
                "name": "3F-视频监控-005",
                "alarmNum": 4,
                "chainRatio": 1.0,
                "ratio": 1.0
            }
        ],
        'THIS_WEEK': [
            {
                "id": "1641758559471480833",
                "name": "3F-UPS-004",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "6F-烟感-004",
                "alarmNum": 98,
                "chainRatio": 65.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "1F-漏水监控设备-003",
                "alarmNum": 46,
                "chainRatio": 38.0,
                "ratio": 24.0
            }, {
                "id": "1651153448948805634",
                "name": "3F-温湿度监控设备-005",
                "alarmNum": 38,
                "chainRatio": 28.0,
                "ratio": 18.0
            }, {
                "id": "1651157867392217090",
                "name": "3F-视频监控-005",
                "alarmNum": 28,
                "chainRatio": 4.0,
                "ratio": 1.0
            }
        ],
        'THIS_MONTH': [
            {
                "id": "1641758559471480833",
                "name": "2F-UPS-005",
                "alarmNum": 161,
                "chainRatio": 100.0,
                "ratio": 94.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-喷淋设备-003",
                "alarmNum": 146,
                "chainRatio": 45.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "3F-漏水监控设备-008",
                "alarmNum": 120,
                "chainRatio": 41.0,
                "ratio": 18.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-温湿度监控设备-005",
                "alarmNum": 104,
                "chainRatio": 38.0,
                "ratio": 7.0
            }, {
                "id": "1651157867392217090",
                "name": "3F-视频监控-005",
                "alarmNum": 45,
                "chainRatio": 28.0,
                "ratio": 7.0
            }
        ],
        'THIS_YEAR': [
            {
                "id": "1641758559471480833",
                "name": "2F-UPS-005",
                "alarmNum": 358,
                "chainRatio": 60.0,
                "ratio": 47.0
            }, {
                "id": "1547504002118238209",
                "name": "2F-气体灭火器-003",
                "alarmNum": 241,
                "chainRatio": 50.0,
                "ratio": 6.0
            }, {
                "id": "1651159322132033538",
                "name": "2F-漏水监控设备-004",
                "alarmNum": 200,
                "chainRatio": 28.0,
                "ratio": 5.0
            }, {
                "id": "1651153448948805634",
                "name": "2F-温湿度监控设备-004",
                "alarmNum": 154,
                "chainRatio": 20.0,
                "ratio": 12.0
            }, {
                "id": "1651157867392217090",
                "name": "3F-视频监控-005",
                "alarmNum": 121,
                "chainRatio": 14.0,
                "ratio": 8.0
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
            "alarmNum": 155,
            "chainRatio": 87.0,
            "alarmStatusStatistics": [{
                "alarmStatus": "ALARM_UN_CONFIRMED",
                "alarmStatusName": "待接收",
                "alarmNum": 82
            }, {
                "alarmStatus": "ALARM_PROGRESS_CONFIRMED",
                "alarmStatusName": "处理中",
                "alarmNum": 12
            }, {
                "alarmStatus": "ALARM_SUSPEND",
                "alarmStatusName": "已挂起",
                "alarmNum": 1
            }, {
                "alarmStatus": "ALARM_HANDLER",
                "alarmStatusName": "已处理",
                "alarmNum": 60
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
