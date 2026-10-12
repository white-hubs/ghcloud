import moment from "moment";
import { ref } from "vue";

import { alarmStatisticsList, statisticsEventTop, statisticsStatus, statisticsLevel, recordStatus } from "@/infrastructure/api/alarm";
import { associatedVideos } from "@/infrastructure/api/device";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { loginSession } from "@/infrastructure/api/mdata";
import { EquipmentInfo } from "@/infrastructure/api/models/equipment";
import { videoListDevices, deviceRemarkPage } from "@/infrastructure/api/vmonitor";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeArea } from "@/visualization-core/stores/area";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export default function () {
  let eventTime = ref<ModelValueItf>();
  const { globalState } = useStateStore();
  const piniaStoreArea = storeArea();
  const piniaStoreMenu = storeMenu();
  // 报警事件排名
  async function getEventTop(params) {
    let alarmRank = await statisticsEventTop(params);
    return alarmRank;
  }
  let takeNotes = ref<ModelValueItf>();
  // 获取报警列表
  async function getAlarmTakeNotes(params) {
    let res = await alarmStatisticsList(params);
    let data = await recordStatus(params);
    let listData = res.records.map((item) => {
      return {
        ...item,
        alarmTimeStamp: item.alarmTime,
        alarmTime: moment(item.alarmTime).format(params.type === "TODAY" ? "HH:mm:ss" : "YYYY-MM-DD"),
      };
    });
    let pieData = [
      {
        value: data.alarmUnresolvedHandlerNum || 0,
        name: "未处理数",
      },
      {
        value: data.alarmTimeoutNum || 0,
        name: "超时报警数",
      },
      {
        value: data.alarmHandlerNum || 0,
        name: "已处理",
      },
    ];
    return {
      listData,
      alarmsNumber: data.alarmNum,
      pieData,
    };
  }
  /**
   * 数组拆分
   * size每组数组多少个，如：10
   * array需要拆分的数组
   */
  function splitArray(array, size) {
    let data = [];
    for (let i = 0; i < array.length; i += size) {
      data.push(array.slice(i, i + size));
    }
    return data;
  }
  // 视频列表
  async function videoList(num?: number) {
    let params = {
      areaId: globalState.business.currentAreaId,
    };
    let data = await videoListDevices(params);
    return splitArray(data, num ? num : 4);
  }
  let alarmLevel = ref<ModelValueItf>();
  // 获取报警级别分布数据
  async function getAlarmLevel(params) {
    let res = await statisticsLevel(params);
    let fakeData = res.map((item) => {
      item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
      item.name += "报警";
      return item;
    });
    return fakeData;
  }
  // 获取报警总数和环比
  async function getAlarmsNumber(params) {
    let Status = await statisticsStatus(params);
    return {
      count: Status.alarmNum,
      ratio: Status.chainRatio,
      alarmStatusStatistics: Status.alarmStatusStatistics,
    };
  }
  // 获取设备数
  async function getEquipmentNumber(): Promise<EquipmentInfo> {
    let params = {
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
    };
    return await equipmentTotal(params);
  }
  let unusualTime = ref<ModelValueItf>();
  // 获取巡逻异常列表
  async function getremakerList(params) {
    const res = await deviceRemarkPage(params);
    const session = await loginSession();
    const records = Array.isArray(res?.records) ? res.records : [];
    return records.map((item) => {
      let filePathList: Array<{ extranetFilePath?: string }> = [];
      try {
        const parsed = item.filePaths ? JSON.parse(item.filePaths) : [];
        filePathList = Array.isArray(parsed) ? parsed : [];
      } catch {
        filePathList = [];
      }
      const imgUrl = filePathList
        .map((data) => data?.extranetFilePath)
        .filter(Boolean)
        .map((path) => `${path}?session=${session?.session ?? ""}`);
      return {
        time: item.createTime ? moment(item.createTime).format("YYYY-MM-DD HH:mm:ss") : "--",
        patrol: item.deviceName || "--",
        reportPerson: item.createByName || "--",
        alarmTargetCode: item.deviceCode || item.alarmTargetCode || "",
        photos: {
          id: item.id,
          url: imgUrl,
        },
      };
    });
  }
  // 获取设备关联监控
  async function getAssociatedVideo(params) {
    return await associatedVideos(params);
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
    getAssociatedVideo,
  };
}
