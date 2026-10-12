// 手术示教

/**
 *  设备异常趋势
 */
export const AbnormalEquipment = <T extends Record<string, any>>(params: string): number[][] => {
    const mokeData = {
        TODAY: [
            [0, 0, 0, 0, 0, 0, 0, 7, 20, 42, 20, 52, 10, 50, 30, 50, 44],
            [0, 0, 0, 0, 0, 0, 0, 7, 20, 31, 20, 52, 10, 20, 18, 36, 54],
        ],
        THIS_WEEK: [
            [18, 28, 38, 48, 58, 68, 20, 40, 33, 12, 14, 52, 12, 10, 20, 30, 40, 50],
            [31, 25, 12, 32, 41, 25, 20, 55, 22, 44, 44, 33, 55, 44, 66, 77, 88, 99],
        ],
        THIS_MONTH: [
            [20, 50, 142, 70, 60, 50, 43, 52, 139, 47, 81, 32, 177, 155, 140, 184],
            [20, 50, 82, 105, 60, 50, 41, 12, 12, 14, 50, 142, 70, 60, 50, 196, 142],
        ],
        THIS_YEAR: [
            [618, 734, 718, 457, 588, 398],
            [540, 479, 479, 704, , 479, 386],
        ],
    }
    return mokeData[params]
}
/**
 *  示教直播场次
 */
export const LiveStreamingSessions = <T extends Record<string, any>>(params: string): number[] => {
    const mokeData = {
        TODAY: [56, 44, 96, 50, 72, 23, 93, 88, 70, 69, 35, 90, 79, 61, 83, 65, 85],
        THIS_WEEK: [50, 68, 40, 94, 35, 89, 77],
        THIS_MONTH: [70, 59, 36, 67, 62, 91, 22, 43, 38, 44, 83, 61, 92, 65, 93, 20, 64, 85, 61],
        THIS_YEAR: [116, 157, 65, 140, 143, 92],
    }
    return mokeData[params]
}
/**
 *  示教设备分类
 */
export const getDeviceType = <T extends Record<string, any>>(params: string): number[] => {
    const mokeData = {
        TODAY: [70, 101, 50, 90],
        THIS_WEEK: [170, 120, 120, 130],
        THIS_MONTH: [210, 200, 210, 230],
        THIS_YEAR: [732, 1900, 2048, 2133],
    }
    return mokeData[params]
}
// 医护对讲
/**
 *  呼叫趋势
 */
export const CallTrends = <T extends Record<string, any>>(params: string): number[] => {
    const mokeData = {
        TODAY: [0, 0, 0, 0, 0, 0, 10, 50, 30, 40, 66, 24, 21, 36, 41, 22],
        THIS_WEEK: [52, 38, 47, 66, 82, 17, 69],
        THIS_MONTH: [74, 120, 63, 107, 184, 170, 150, 97, 190, 76, 52, 192, 77, 143, 147, 120, 152],
        THIS_YEAR: [427, 532, 636, 301, 718, 666],
    }
    return mokeData[params]
}
