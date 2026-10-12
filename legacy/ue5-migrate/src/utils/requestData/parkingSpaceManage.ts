import { getParkingOverview, getPayIntervalTrend, getParkingDuration, parkingGetPayTrend, parkingGetPayType, parkingGetTrafficTrend, TrafficFlowDistribution, getMoneyOverview } from '@/api/park-management'
// 车位总览
export const parkingData = async () => {
    let parkingLotTotal: any = {
        empty: 0,
        total: 0,
        used: 0,
        percentageUsed: '',
        percentIdle: ''
    }
    let circlePieData = 0
    let dataList = []
    parkingLotTotal = await getParkingOverview()
    if (parkingLotTotal) {
        parkingLotTotal.percentageUsed = (Math.round(parkingLotTotal.used / parkingLotTotal.total * 10000) / 100.00) + '%'
        parkingLotTotal.percentIdle = (Math.round(parkingLotTotal.empty / parkingLotTotal.total * 10000) / 100.00) + '%'
        circlePieData = Math.round(parkingLotTotal.used / parkingLotTotal.total * 10000) / 100.00
    }
    dataList = [
        {
            title: '使用车位' + (parkingLotTotal?.percentageUsed||'0%'),
            value: parkingLotTotal?.used || 0,
            ringRatio: false,
            color: '#2989FF'
        }, {
            title: '空闲车位' +( parkingLotTotal?.percentIdle || '0%'),
            value: parkingLotTotal?.empty || 0,
            ringRatio: false,
            color: '#19F8F7'
        },
    ]
    return {
        parkingLotTotal:parkingLotTotal||{
            empty: 0,
            total: 0,
            used: 0,
          },
        circlePieData,
        dataList
    }
}
// 车流趋势
export const trafficFlowTrend = async (params) => {
    let res = await parkingGetTrafficTrend(params)
    res.xdata = res.xdata.map(item => {
        if (params.dimension === 'TODAY') {
            return item += '时'
        } else if (params.dimension === 'THIS_YEAR') {
            return item += '月'
        } else {
            return item
        }
    });
    return res
}
// 滞留车辆分析
export const vehicleAnalysisData = async () => {
    let res = await TrafficFlowDistribution()
    res.xdata[res.xdata.length - 1] += '以上'
    return res
}
// 收费总览
export const chargingOverview = async (params) => {
    let res = await getMoneyOverview(params)
    let arr = [
        {
            img: 'money.png',
            value: res.freeAmount > 100000 ? (res.freeAmount / 10000).toFixed(2) : res.freeAmount,
            label: res.freeAmount > 100000 ? '实收总金额（万元）' : '实收总金额（元）',
            ringRatio: res.freeAmountRingRatio
        }, {
            img: 'income.png',
            value: res.receivableAmount > 100000 ? (res.receivableAmount / 10000).toFixed(2) : res.receivableAmount,
            label: res.receivableAmount > 100000 ? '应收总金额（万元）' : '应收总金额（元）',
            ringRatio: res.receivableAmountRingRatio
        }, {
            img: 'charge.png',
            value: res.discountAmount > 100000 ? (res.discountAmount / 10000).toFixed(2) : res.discountAmount,
            label: res.discountAmount > 100000 ? '免费总金额（万元）' : '免费总金额（元）',
            ringRatio: res.discountAmountRingRatio
        },
    ]
    return arr
}
// 支付方式占比
export const paymentMethod = async (params) => {
    let res = await parkingGetPayType(params)
    let total = 0
    let arr = res.map(item => {
        total += item.freeAmount
        return {
            label: item.name,
            value: item.freeAmount > 10000 ? (item.freeAmount / 10000).toFixed(2) + '万元' : item.freeAmount+'元',
            color: ''
        }
    })
    return {
        arr,
        total
    }
}
// 收费趋势
export const chargingTrends = async (params) => {
    let res = await parkingGetPayTrend(params)
    res.xdata = res.xdata.map(item => {
        if (params.dimension === 'TODAY') {
            return item += '时'
        } else if (params.dimension === 'THIS_YEAR') {
            return item += '月'
        } else {
            return item
        }
    });
    return res
}
// 停车时长分布
export const parkingDuration = async (params) => {
    return await getParkingDuration(params)

}
// 收费区间分布
export const tollInterval = async (params) => {
    return await getPayIntervalTrend(params)
}