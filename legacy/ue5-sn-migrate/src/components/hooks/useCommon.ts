import { alarmStatisticsList, statisticsEventTop, statisticsStatus, statisticsLevel, recordStatus } from '@/api/alarm'
import { ModelValueItf } from '../businessPanel/public/types'
import { storeArea } from "@/piniaStore/area"
import { storeMenu } from "@/piniaStore/menu"
import { videoListDevices, deviceRemarkPage } from '@/api/vmonitor'
import { equipmentTotal } from '@/api/equipment'
import { associatedVideos } from '@/api/device'
import { loginSession } from '@/api/mdata'
import { ref } from 'vue'
import moment from "moment";
import { EquipmentInfo } from '@/api/models/equipment'

export default function () {
    let eventTime = ref<ModelValueItf>()
    const piniaStoreArea = storeArea();
    const piniaStoreMenu = storeMenu();
    // 报警事件排名
    async function getEventTop(params) {
        let alarmRank = await statisticsEventTop(params)
        return alarmRank
    }
    let takeNotes = ref<ModelValueItf>()
    // 获取报警列表
    async function getAlarmTakeNotes(params) {
        let res = await alarmStatisticsList(params)
        let data = await recordStatus(params)
        let listData = res.records.map(item => {
            return {
                ...item,
                alarmTimeStamp:item.alarmTime,
                alarmTime: moment(item.alarmTime).format(params.type === 'TODAY' ? "HH:mm:ss" : "YYYY-MM-DD"),
            }
        })
        let pieData = [
            {
                value: data.alarmUnresolvedHandlerNum || 0,
                name: '未处理数'
            },
            {
                value: data.alarmTimeoutNum || 0,
                name: '超时报警数'
            }]
        return {
            listData, alarmsNumber: data.alarmNum, pieData
        }
    }
    /**
     * 数组拆分
     * size每组数组多少个，如：10
     * array需要拆分的数组
     */
    function splitArray(array, size) {
        let data = [];
        for (let i = 0; i < array.length; i += size) {
            data.push(array.slice(i, i + size))
        }
        return data
    }
    // 视频列表
    async function videoList(num?:number) {
        let params = {
            areaId: piniaStoreArea.currentAreaId,
        }
        let data = await videoListDevices(params)
        return splitArray(data, num?num:4)
    }
    let alarmLevel = ref<ModelValueItf>()
    // 获取报警级别分布数据
    async function getAlarmLevel(params) {
        let res = await statisticsLevel(params)
        let fakeData = res.map(item => {
            item.chainRatio <= 0 ? item.isGrow = false : item.isGrow = true
            item.name += '报警'
            return item
        })
        return fakeData
    }
    // 获取报警总数和环比
    async function getAlarmsNumber(params) {
        let Status = await statisticsStatus(params)
        return {
            count: Status.alarmNum,
            ratio: Status.chainRatio,
            alarmStatusStatistics:Status.alarmStatusStatistics
        }
    }
    // 获取设备数
    async function getEquipmentNumber():Promise<EquipmentInfo> {
        let params = {
            sceneType: piniaStoreMenu.currentMenu,
            areaId: piniaStoreArea.currentAreaId
        }
        return await equipmentTotal(params)
    }
    let unusualTime = ref<ModelValueItf>()
    // 获取巡逻异常列表
    async function getremakerList(params) {
        let res = await deviceRemarkPage(params)
        let session = await loginSession()
        return res.records.map(item => {
            let filePathList = JSON.parse(item.filePaths)
            let imgUrl = filePathList.map(data => {
                // if (location.protocol === 'http:') {
                //     return data.intranetFilePath + `${session ? '?session=' + session : ''}`
                // } else {
                    return data.extranetFilePath+ `${session ? '?session=' + session : ''}`
                // }
            })
            return {
                time: moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                patrol: item.deviceName,
                reportPerson: item.createByName,
                photos: {
                    id: item.id,
                    url: imgUrl
                }
            }
        })

    }
    // 获取设备关联监控
    async function getAssociatedVideo(params) {
        return await associatedVideos(params)
    }
    return {
        piniaStoreArea,
        piniaStoreMenu,
        eventTime,
        getEventTop,
        takeNotes,
        getAlarmTakeNotes,
        videoList,
        alarmLevel,
        getAlarmLevel,
        getAlarmsNumber,
        getEquipmentNumber,
        unusualTime,
        getremakerList,
        getAssociatedVideo
    }
}
