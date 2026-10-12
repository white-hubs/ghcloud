import { getDoorAccessSummary, getDoorAnomalousTop, getDoorEventRecord, getParkingOverview, getDoorThroughType, getEventRecord } from '@/api/door'
import moment from "moment";
import { useStateStore } from '@/pages/state/use-state-store'
const { globalState } = useStateStore()

// 设备实时状态
export const deviceStatus = async () => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
    }
    const colorList = ["#19F8F7", "#FFC700", "#46647E"]
    let res = await getParkingOverview(param)
    let data = []
    let total = 0
    data = res.map((item, index) => {
        total += item.value
        return {
            label: `${item.name}  (${item.ringRatio ? item.ringRatio : 0}%)`,
            color: colorList[index],
            value: item.value
        }
    })
    return {
        data,
        total
    }
}
// 异常事件Top5
export const alarmEvent = async (params) => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        dimension: params
    }
    let res = await getDoorAnomalousTop(param)
    return res || []
}
// 异常通行趋势
export const abnormalPassage = async (params, type) => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        eventResult: type,
        dimension: params
    }
    let res = await getEventRecord(param)
    res.xdata = res.xdata.map(item => {
        if (params === 'today') {
            return item += '日'
        } else if (params === 'year') {
            return item += '月'
        } else {
            return item
        }
    });
    return res
}
// 通行类型占比
export const accessType = async (params) => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        dimension: params
    }
    let res = await getDoorThroughType(param)
    let color = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"]
    let arr = res.data.map((item, index) => {
        return {
            label: item.name,
            color: color[index],
            value: item.value
        }
    })
    return arr
}
// 实时通行数据
export const throughData = async () => {
    let param = {
        pageSize: 50,
        pageNumber: 1,
    }
    let res = await getDoorEventRecord(param)
    res.records.forEach(item => {
        item.eventTime = moment(item.eventTime).format('YYYY-MM-DD HH:mm:ss')
    });
    return res.records
}
// 通行分析
export const trafficAnalysis = async (params) => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        dimension: params
    }
    let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    let res = await getDoorAccessSummary(param)
    let total = 0
    let arr = res.data.map((item, index) => {
        total += item.value
        return { label: item.name, color: colorList[index], value: item.value }
    })
    return {
        total, arr
    }
}