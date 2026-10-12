// 电梯管理

/**
 *  故障检修趋势
 */
export const Troubleshooting = <T extends Record<string, any>>(params: string): number[][] => {
    const mokeData = {
        TODAY: [
            [0, 0, 0, 0, 0, 0, 0, 45, 20, 78, 51, 51, 5, 14, 30, 15, 30, 20],
            [0, 0, 0, 0, 0, 0, 0, 140, 92, 78, 98, 60, 190, 104, 125, 84, 148, 20],
        ],
        THIS_WEEK: [
            [45, 80, 102, 43, 50, 68, 71, 91],
            [77, 63, 63, 157, 52, 71, 84, 77],
        ],
        THIS_MONTH: [
            [14, 28, 119, 32, 47, 70, 184, 30, 10, 58, 46, 105, 155, 200, 170, 39, 80, 90],
            [192, 147, 150, 32, 47, 70, 45, 30, 10, 58, 188, 105, 108, 200, 170, 164, 161, 113],
        ],
        THIS_YEAR: [
            [514, 407, 424, 389, 794, 474],
            [697, 758, 457, 588, 400, 300],
        ],
    }
    return mokeData[params]
}
/**
 *  
运行分析
 */
export const OperationsAnalysis = <T extends Record<string, any>>(params: string): number[] => {
    const mokeData = {
        TODAY: [ 30, 60, 170, 180, 120, 75],
        THIS_WEEK: [130, 160, 70, 180, 80, 175, 44],
        THIS_MONTH: [0, 90, 0, 180, 0, 75, 40, 90, 270, 180, 0, 75, 40, 90, 0, 180, 0, 75],
        THIS_YEAR: [60, 10, 170, 180, 80, 75]
    }
    return mokeData[params]
}
/**
 *  报警分析
 */
interface alarmAnalysisType {
    name: string;
    value: number;
    color: string;
}

export const alarmAnalysis = <T extends Record<string, any>>(params: string): alarmAnalysisType[] => {
    const mokeData = {
        TODAY: [
            {
                name: '安全回路不通',
                value: 30,
                color: '#306CCA',
            },
            {
                name: '启动允许错误',
                value: 32,
                color: '#3590FF',
            },
            {
                name: '关门到位丢失',
                value: 20,
                color: '#19F8F7',
            },
            {
                name: 'AC供电故障',
                value: 18,
                color: '#2AE8BD',
            },
            {
                name: '多次关门失败',
                value: 50,
                color: '#FFC700',
            },
            {
                name: 'DRB板故障',
                value: 45,
                color: '#FF6E23',
            },
        ],
        THIS_WEEK: [
            {
                name: '安全回路不通',
                value: 97,
                color: '#306CCA',
            },
            {
                name: '启动允许错误',
                value: 65,
                color: '#3590FF',
            },
            {
                name: '关门到位丢失',
                value: 58,
                color: '#19F8F7',
            },
            {
                name: 'AC供电故障',
                value: 180,
                color: '#2AE8BD',
            },
            {
                name: '多次关门失败',
                value: 80,
                color: '#FFC700',
            },
            {
                name: 'DRB板故障',
                value: 175,
                color: '#FF6E23',
            },
        ],
        THIS_MONTH: [
            {
                name: '安全回路不通',
                value: 130,
                color: '#306CCA',
            },
            {
                name: '启动允许错误',
                value: 160,
                color: '#3590FF',
            },
            {
                name: '关门到位丢失',
                value: 301,
                color: '#19F8F7',
            },
            {
                name: 'AC供电故障',
                value: 180,
                color: '#2AE8BD',
            },
            {
                name: '多次关门失败',
                value: 321,
                color: '#FFC700',
            },
            {
                name: 'DRB板故障',
                value: 459,
                color: '#FF6E23',
            },
        ],
        THIS_YEAR: [
            {
                name: '安全回路不通',
                value: 714,
                color: '#306CCA',
            },
            {
                name: '启动允许错误',
                value: 774,
                color: '#3590FF',
            },
            {
                name: '关门到位丢失',
                value: 479,
                color: '#19F8F7',
            },
            {
                name: 'AC供电故障',
                value: 759,
                color: '#2AE8BD',
            },
            {
                name: '多次关门失败',
                value: 565,
                color: '#FFC700',
            },
            {
                name: 'DRB板故障',
                value: 428,
                color: '#FF6E23',
            },
        ],
    }
    return mokeData[params]
}
/**
 *  告警类型TOP5
 */
export const AlarmTypeTop = <T extends Record<string, any>>(params: string): number[] => {
    const mokeData = {
        TODAY: [72, 156, 78, 97, 81],
        THIS_WEEK: [140, 156, 188, 194, 173],
        THIS_MONTH: [624, 681, 756, 588, 459],
        THIS_YEAR: [2039, 3729, 4025, 3490, 3943],
    }
    return mokeData[params]
}
/**
 *  电梯状态监测
 */
export const ElevatorStatu = <T extends Record<string, any>>(params: string) => {
    const mokeData = {
        TODAY: {
            customerUse: [null, 1, 4, 6, 9, 11, null],
            freightUse: [null, null, null, null, null, null, 3],
            specialPurpose: [1, null, null, null, null, null, null],
        },
        THIS_WEEK: {
            customerUse: [null, 4, 8, 12, 15, 16, null],
            freightUse: [null, null, null, null, null, null, 7],
            specialPurpose: [4, null, null, null, null, null, null],
        },
        THIS_MONTH: {
            customerUse: [null, 8, 10, 14, 19, 19, null],
            freightUse: [null, null, null, null, null, null, 10],
            specialPurpose: [8, null, null, null, null, null, null],
        },
        THIS_YEAR: {
            customerUse: [null, 14, 13, 17, 21, 21, null],
            freightUse: [null, null, null, null, null, null, 14],
            specialPurpose: [14, null, null, null, null, null, null],
        },
    }
    return mokeData[params]
}