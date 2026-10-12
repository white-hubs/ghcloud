import {  statisticsStatus, equipmentAlarmRate, alarmStatisticsList, statisticsTrend } from '@/api/alarm'
import { storeArea } from "@/piniaStore/area"
import enumeratie from '@/utils/enumeratie';
import moment from 'moment';
const piniaStoreArea = storeArea();
const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();

// 设备报警趋势
export const alarmTrend = async (params) => {
    let res = await statisticsTrend(params)
    const ydata = []
    const xdata = []
    res.forEach(item => {
        ydata.push(item.alarmNum)
        let time = ''
        if (params.type === 'TODAY') {
            time = '时'
        } else if (params.type === 'THIS_YEAR') {
            time = '月'
        } else {
            time = '号'
        }
        xdata.push(item.period + time)
    })
    return {
        ydata, xdata
    }
}
// 设备报警数量
export const equipmentNumber = async (params) => {
    let res = await statisticsStatus(params)
    res.alarmStatusStatistics.forEach(item => {
        alarmStatusOptions.value.forEach(element => {
            if (item.alarmStatus === element.value) {
                item.color = element.color
            }
        });
    })
    return res
}
export const equipmentAlarmRateData = async (params) => {
    let res = await equipmentAlarmRate(params)
    return res
}
// 报警记录列表
export const aralmDataList = async (params) => {
    let res = await alarmStatisticsList(params)
    res.records.forEach(item => {
        item.alarmTime = moment(item.alarmTime).format('YYYY-MM-DD HH:mm:ss')
    });
    return res
}
// 获取报警趋势折线图
export const alarmTrendEcharts = async (params) => {
    let Trend = await statisticsTrend(params)
    let xData = []
    let yData = []
    Trend.forEach(item => {
        let time = ''
        if (params.type === 'TODAY') {
            time = '时'
        } else if (params.type === 'THIS_YEAR') {
            time = '月'
        } else {
            time = '号'
        }
        xData.push(item.period + time)
        yData.push(item.alarmNum)
    });
    return {
        xData, yData
    }
}