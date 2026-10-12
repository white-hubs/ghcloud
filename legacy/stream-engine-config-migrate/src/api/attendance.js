import request from '@/utils/request'
let baseURL = '/api/attendance'

// 考勤组分页
export const getAttendanceGroupPage = (params, method = 'get') =>
    request({
        url: baseURL + '/attendance-group/page',
        method: method,
        params
    })

// 考勤组列表
export const getAttendanceGroupList = (params, method = 'get') =>
    request({
        url: baseURL + '/attendance-group/list',
        method: method,
        params
    })

// 考勤组删除
export const deleteAttendanceGroup = (params, method = 'DELETE') =>
    request({
        url: baseURL + `/attendance-group/${params?.id ?? params}`,
        method: method,
    })

// 考勤组详情
export const getAttendanceGroup = (params, method = 'get') =>
    request({
        url: baseURL + `/attendance-group/${params?.id ?? params}`,
        method: method,
    })

// 考勤组获取枚举数据
export const getAttendanceGroupEnumerate = (params, method = 'get') =>
    request({
        url: baseURL + `/attendance-group/enumerate/list`,
        method: method,
        params
    })


// 考勤组新增或修改
export const postAttendanceGroup = (data, method = 'POST') =>
    request({
        url: baseURL + `/attendance-group`,
        method: method,
        data
    })


/**********************/

// 补卡规则分页
export const getCardRulePage = (params, method = 'get') =>
    request({
        url: baseURL + '/card-rule/page',
        method: method,
        params
    })

// 补卡规则列表
export const getCardRuleList = (params, method = 'get') =>
    request({
        url: baseURL + '/card-rule/list',
        method: method,
        params
    })

// 补卡规则删除
export const deleteCardRule = (params, method = 'DELETE') =>
    request({
        url: baseURL + `/card-rule/${params?.id ?? params}`,
        method: method,
    })

// 补卡规则详情
export const getCardRule = (params, method = 'get') =>
    request({
        url: baseURL + `/card-rule/${params?.id ?? params}`,
        method: method,
    })


// 补卡规则新增或修改
export const postCardRule = (data, method = 'POST') =>
    request({
        url: baseURL + `/card-rule`,
        method: method,
        data
    })


/**********************/

// 加班规则分页
export const getWorkOvertimeRulePage = (params, method = 'get') =>
    request({
        url: baseURL + '/work-overtime-rule/page',
        method: method,
        params
    })

// 加班规则枚举
export const getWorkOvertimeRuleEnumerate = (params, method = 'get') =>
    request({
        url: baseURL + '/work-overtime-rule/enumerate/list',
        method: method,
        params
    })

// 加班规则删除
export const deleteWorkOvertimeRule = (params, method = 'DELETE') =>
    request({
        url: baseURL + `/work-overtime-rule/${params?.id ?? params}`,
        method: method,
    })

// 补卡规则详情
export const getWorkOvertimeRule = (params, method = 'get') =>
    request({
        url: baseURL + `/work-overtime-rule/${params?.id ?? params}`,
        method: method,
    })


//补卡规则新增或修改
export const postWorkOvertimeRule = (data, method = 'POST') =>
    request({
        url: baseURL + `/work-overtime-rule`,
        method: method,
        data
    })


/**********************/

// 班次分页
export const getClassesPage = (params, method = 'get') =>
    request({
        url: baseURL + '/classes/page',
        method: method,
        params
    })

// 班次列表
export const getClassesList = (params, method = 'get') =>
    request({
        url: baseURL + '/classes/list',
        method: method,
        params
    })

// 班次删除
export const deleteClasses = (params, method = 'DELETE') =>
    request({
        url: baseURL + `/classes/${params?.id ?? params}`,
        method: method,
    })

// 班次详情
export const getClasses = (params, method = 'get') =>
    request({
        url: baseURL + `/classes/${params?.id ?? params}`,
        method: method,
    })


// 班次新增或修改
export const postClasses = (data, method = 'POST') =>
    request({
        url: baseURL + `/classes`,
        method: method,
        data
    })

// 排班分页查询
export const getArrangeWork = (params, method = 'get') =>
    request({
        url: baseURL + `/arrange-work/page`,
        method: method,
        params
    })

// 手动排班
export const postArrangeWork = (data, method = 'POST') =>
    request({
        url: baseURL + `/arrange-work`,
        method: method,
        data
    })

// 值班分页查询
export const getDutyWork = (params, method = 'get') =>
    request({
        url: baseURL + `/duty-work/page`,
        method: method,
        params
    })

// 手动值班
export const postDutyWork = (data, method = 'POST') =>
    request({
        url: baseURL + `/duty-work`,
        method: method,
        data
    })

/***************************/

// 假期类型分页列表
export const getHoliday = (params, method = 'get') =>
    request({
        url: baseURL + `/holiday/page`,
        method: method,
        params
    })

// 假期类型列表
export const getHolidayList = (params, method = 'get') =>
    request({
        url: baseURL + `/att/holiday/rule/list`,
        method: method,
        params
    })

// 员工假期余额列表
export const getHolidayBalancePage = (params, method = 'get') =>
    request({
        url: baseURL + `/holiday/balance/page`,
        method: method,
        params
    })

// 假期详情
export const getHolidayDetail = (params, method = 'get') =>
    request({
        url: baseURL + `/detail/id/${params?.id ?? params}`,
        method: method,
    })

// 假期详情
export const getHolidayDetailType = (params, method = 'get') =>
    request({
        url: baseURL + `/detail/type/${params?.type ?? params}`,
        method: method,
    })

// 假期详情
export const putHoliday = (data, method = 'put') =>
    request({
        url: baseURL + `/holiday/id/${data?.id ?? data}`,
        method: method,
        data
    })

/*********加班申请**********/

// 加班记录查询
export const getWorkOvertimeDetail = (params, method = 'get') =>
    request({
        url: baseURL + `/work/overtime/detail`,
        method: method,
    })
/**********************/

// 获取加班时长
export const getWorkOvertimeDuration = (params, method = 'get') =>
    request({
        url: baseURL + `/work/overtime/duration`,
        method: method,
        params
    })

// 获取加班时间段
export const getWorkOvertimePeriod = (params, method = 'get') =>
    request({
        url: baseURL + `/work/overtime/period`,
        method: method,
        params
    })

// PC端打卡列表
export const getClockPage = (params, method = 'get') =>
    request({
        url: baseURL + `/clock/page`,
        method: method,
        params
    })


/*********换班***********/

// 查询班次信息
export const getWorkClasses = (params, method = 'get') =>
    request({
        url: baseURL + `/work/classes`,
        method: method,
        params
    })

// 查询补卡班次信息
export const getClockClasses = (params, method = 'get') =>
    request({
        url: baseURL + `/clock/classes/exp`,
        method: method,
        params
    })

// 查询换班人员
export const getWorkUsers = (params, method = 'get') =>
    request({
        url: baseURL + `/work/users`,
        method: method,
        params
    })
