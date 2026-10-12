// 园区总览

/**
 *  接诊情况总览
 */
interface OverviewSituationType {
    name: string;
    dayData: number;
    total: number;
}
export const OverviewSituation = <T extends Record<string, any>>(params: number): OverviewSituationType[] => {
    const mokeData = [
        [{
            name: '门诊',
            dayData: 30,
            total: 345
        },
        {
            name: '急诊',
            dayData: 20,
            total: 345
        },
        {
            name: '住院',
            dayData: 10,
            total: 345
        }],
        [{
            name: '门诊',
            dayData: 45,
            total: 345
        },
        {
            name: '急诊',
            dayData: 30,
            total: 345
        },
        {
            name: '住院',
            dayData: 68,
            total: 345
        }],
        [{
            name: '门诊',
            dayData: 80,
            total: 345
        },
        {
            name: '急诊',
            dayData: 60,
            total: 345
        },
        {
            name: '住院',
            dayData: 76,
            total: 345
        }],
        [{
            name: '门诊',
            dayData: 120,
            total: 345
        },
        {
            name: '急诊',
            dayData: 77,
            total: 345
        },
        {
            name: '住院',
            dayData: 86,
            total: 345
        }],
    ]
    return mokeData[params]
}
// 运维态势

/**
 *  设备情况总览
 */
interface EquipmentSituationType {
    name: string;
    value: number;
    color: string;
}
export const EquipmentSituation = <T extends Record<string, any>>(params: number): EquipmentSituationType[] => {
    const mokeData = [
        [{
            name: '正常',
            value: 18,
            color: '#2AE8BD',
        },
        {
            name: '离线',
            value: 2,
            color: '#2989FF',
        },
        {
            name: '故障',
            value: 5,
            color: '#FFC700',
        },
        {
            name: '告警',
            value: 3,
            color: '#F14545',
        }],
        [{
            name: '正常',
            value: 25,
            color: '#2AE8BD',
        },
        {
            name: '离线',
            value: 3,
            color: '#2989FF',
        },
        {
            name: '故障',
            value: 4,
            color: '#FFC700',
        },
        {
            name: '告警',
            value: 1,
            color: '#F14545',
        }],
        [{
            name: '正常',
            value: 30,
            color: '#2AE8BD',
        },
        {
            name: '离线',
            value: 7,
            color: '#2989FF',
        },
        {
            name: '故障',
            value: 2,
            color: '#FFC700',
        },
        {
            name: '告警',
            value: 3,
            color: '#F14545',
        }],
        [{
            name: '正常',
            value: 35,
            color: '#2AE8BD',
        },
        {
            name: '离线',
            value: 2,
            color: '#2989FF',
        },
        {
            name: '故障',
            value: 4,
            color: '#FFC700',
        },
        {
            name: '告警',
            value: 7,
            color: '#F14545',
        }],
        [{
            name: '正常',
            value: 40,
            color: '#2AE8BD',
        },
        {
            name: '离线',
            value: 5,
            color: '#2989FF',
        },
        {
            name: '故障',
            value: 4,
            color: '#FFC700',
        },
        {
            name: '告警',
            value: 7,
            color: '#F14545',
        }],
    ]
    return mokeData[params]
}

// 运营态势

/**
 *  今日门诊情况
 */
interface OutpatientSituationType {
    yData: number[];
    situation: {
        total: number;
        offlineNum: number;
    };
}
export const OutpatientSituation = <T extends Record<string, any>>(params: number): OutpatientSituationType => {
    const mokeData = [
        {
            yData: [3345, 1054, 140, 2134],
            situation: { total: 1000, offlineNum: 2134 },
        },
        {
            yData: [2405, 940, 468, 1549],
            situation: { total: 2405, offlineNum: 1549 },
        },
        {
            yData: [2200, 700, 800, 1201],
            situation: { total: 2200, offlineNum: 1201 },
        },
        {
            yData: [1800, 554, 680, 635],
            situation: { total: 1800, offlineNum: 635 },
        },
        {
            yData: [1000, 500, 341, 234],
            situation: { total: 1000, offlineNum: 234 },
        },
    ]
    return mokeData[params]
}
/**
 *  急诊接诊情况
 */
interface ReceptionStatusType {
    TODAY: number[];
    THIS_WEEK: number[];
    THIS_MONTH: number[];
    THIS_YEAR: number[];
}
export const ReceptionStatus = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        "TODAY": [0, 0, 0, 0, 0, 0, 0, 10, 12, 8, 15, 9, 7],
        "THIS_WEEK": [25, 28, 45, 50, 47, 12, 12],
        "THIS_MONTH": [208, 0, 0, 158, 0, 217, 0, 148, 0, 0, 217, 265, 50, 0, 0, 320, 120],
        "THIS_YEAR": [500, 610, 470, 650, 300, 840],
    }
    return mokeData[params]
}
/**
 *  病房床位情况
 */
export const BedSituation = <T extends Record<string, any>>(params: number) => {
    const mokeData = [
        [{
            color: '#2989FF',
            name: '床位数',
            value: 1333
        },
        {
            color: '#FFC700',
            name: '已使用',
            value: 208
        }],
        [{
            color: '#2989FF',
            name: '床位数',
            value: 1333
        },
        {
            color: '#FFC700',
            name: '已使用',
            value: 307
        }],
        [{
            color: '#2989FF',
            name: '床位数',
            value: 1333
        },
        {
            color: '#FFC700',
            name: '已使用',
            value: 414
        }],
        [{
            color: '#2989FF',
            name: '床位数',
            value: 1333
        },
        {
            color: '#FFC700',
            name: '已使用',
            value: 644
        }],
    ]
    return mokeData[params]
}
/**
 *  今日会议情况
 */
interface MeetingSituationType {
    value: number;
    list: {
        title: string;
        value: number;
        color: string;
    }[]
}
export const MeetingSituation = <T extends Record<string, any>>(params: number): MeetingSituationType => {
    const mokeData = [
        {
            value: 3,
            list: [
                { title: "进行中(30%)", value: 3, color: '#FFC700' },
                { title: "已结束(10%)", value: 2, color: '#2989FF' },
                { title: "未开始(10%)", value: 1, color: '#19F8F7' },
            ]
        },
        {
            value: 4,
            list: [
                { title: "进行中(40%)", value: 4, color: '#FFC700' },
                { title: "已结束(3%)", value: 3, color: '#2989FF' },
                { title: "未开始(10%)", value: 1, color: '#19F8F7' },
            ]
        },
        {
            value: 3,
            list: [
                { title: "进行中(60%)", value: 6, color: '#FFC700' },
                { title: "已结束(30%)", value: 3, color: '#2989FF' },
                { title: "未开始(10%)", value: 1, color: '#19F8F7' },
            ]
        },
        {
            value: 3,
            list: [
                { title: "进行中(50%)", value: 5, color: '#FFC700' },
                { title: "已结束(10%)", value: 1, color: '#2989FF' },
                { title: "未开始(20%)", value: 2, color: '#19F8F7' },
            ]
        },
    ]
    return mokeData[params]
}

/**
 *  接诊情况总览
 */
export const OverviewReceptionStatus = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        TODAY: [{
            name: '门诊',
            dayData: 100,
            total: 540
        },
        {
            name: '急诊',
            dayData: 10,
            total: 345
        },
        {
            name: '住院',
            dayData: 40,
            total: 900
        }],
        THIS_WEEK: [{
            name: '门诊',
            dayData: 277,
            total: 3000
        },
        {
            name: '急诊',
            dayData: 32,
            total: 1000
        },
        {
            name: '住院',
            dayData: 148,
            total: 5000
        }],
        THIS_MONTH: [{
            name: '门诊',
            dayData: 1502,
            total: 8000
        },
        {
            name: '急诊',
            dayData: 145,
            total: 3000
        },
        {
            name: '住院',
            dayData: 450,
            total: 8000
        }],
        THIS_YEAR: [{
            name: '门诊',
            dayData: 29420,
            total: 52000
        },
        {
            name: '急诊',
            dayData: 1804,
            total: 12000
        },
        {
            name: '住院',
            dayData: 3540,
            total: 40000
        }],
    }
    return mokeData[params]
}
/**
 *  安全态势总览
 */
export const SecuritySituationOverview = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        TODAY: [
            [10, 20, 30, 40],
            [18, 25, 48, 52],
        ],
        THIS_WEEK: [
            [45, 48, 77, 154],
            [110, 98, 98, 104],
        ],
        THIS_MONTH: [
            [98, 47, 76, 82],
            [82, 47, 40, 92]
        ],
        THIS_YEAR: [
            [874, 820, 765, 680],
            [687, 795, 750, 680],
        ],
    }
    return mokeData[params]
}
/**
 *  人车出入情况
 */
export const SituationPeoplevehicles = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        TODAY: [
            {
                statistic: { icon: 'overView13.png' },
                legendList: [
                    { name: '进入', color: '#2AE8BD', value: 120 },
                    { name: '离开', color: '#2989FF', value: 80 }
                ]
            },
            {
                statistic: { icon: 'overView30.png' },
                legendList: [
                    { name: '进入', color: '#2AE8BD', value: 45 },
                    { name: '离开', color: '#2989FF', value: 23 }
                ]
            },
        ],
        THIS_WEEK: [
            {
                statistic: { icon: 'overView13.png' },
                legendList: [
                    { name: '进入', color: '#2AE8BD', value: 308 },
                    { name: '离开', color: '#2989FF', value: 281 }
                ]
            },
            {
                statistic: { icon: 'overView30.png' },
                legendList: [
                    { name: '进入', color: '#2AE8BD', value: 185 },
                    { name: '离开', color: '#2989FF', value: 169 }
                ]
            },
        ],
        THIS_MONTH: [{
            statistic: { icon: 'overView13.png' },
            legendList: [
                { name: '进入', color: '#2AE8BD', value: 2314 },
                { name: '离开', color: '#2989FF', value: 1842 }
            ]
        },
        {
            statistic: { icon: 'overView30.png' },
            legendList: [
                { name: '进入', color: '#2AE8BD', value: 2047 },
                { name: '离开', color: '#2989FF', value: 2017 }
            ]
        },],
        THIS_YEAR: [{
            statistic: { icon: 'overView13.png' },
            legendList: [
                { name: '进入', color: '#2AE8BD', value: 20478 },
                { name: '离开', color: '#2989FF', value: 20210 }
            ]
        },
        {
            statistic: { icon: 'overView30.png' },
            legendList: [
                { name: '进入', color: '#2AE8BD', value: 18658 },
                { name: '离开', color: '#2989FF', value: 17599 }
            ]
        },],
    }
    return mokeData[params]
}
/**
 * 能耗态势总览
 */
export const OverviewConsumptionSituation = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        TODAY: [900, -3.8, 631, -0.9, 945, -1.5, 854, -0.8],
        THIS_WEEK: [1244, -2, 854, -1.8, 1633, -2.5, 1054, -3.0],
        THIS_MONTH: [1451, -4.8, 1380, -2.9, 1954, -5.5, 1354, -2.8],
        THIS_YEAR: [2046, -8.8, 1465, -5.9, 2540, -8.5, 1853, -5.8],
    }
    return mokeData[params]
}