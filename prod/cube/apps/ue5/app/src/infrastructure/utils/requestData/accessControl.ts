import moment from "moment";

import {
  getDoorAccessSummary,
  getDoorAnomalousTop,
  getDoorEventRecord,
  getParkingOverview,
  getDoorThroughType,
  getEventRecord,
} from "@/infrastructure/api/door";
import { useStateStore } from "@/visualization-core/stores/use-state-store";
const { globalState } = useStateStore();

// 设备实时状态
export const deviceStatus = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  const colorList = ["#328BF7", "#FFAB10", "#19F8F7"];
  let res = await getParkingOverview(param);
  let data = [];
  let total = 0;
  data = res.map((item, index) => {
    total += item.value;
    const name = String(item.name ?? "");
    const color = /离线|故障|异常|告警/.test(name)
      ? "#FFAB10"
      : /在线|正常|运行/.test(name)
        ? "#328BF7"
        : colorList[index % colorList.length];
    return {
      label: `${name}  (${item.ringRatio ? item.ringRatio : 0}%)`,
      name,
      color,
      value: item.value,
      ringRatio: item.ringRatio,
    };
  });
  return {
    data,
    total,
  };
};
// 异常事件Top5
export const alarmEvent = async (params) => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    dimension: params,
  };
  let res = await getDoorAnomalousTop(param);
  return res || [];
};
// 异常通行趋势
export const abnormalPassage = async (params, type) => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    eventResult: type,
    dimension: params,
  };
  let res = await getEventRecord(param);
  res.xdata = res.xdata.map((item) => {
    if (params === "today") {
      return (item += "日");
    } else if (params === "year") {
      return (item += "月");
    } else {
      return item;
    }
  });
  return res;
};
// 通行类型占比
export const accessType = async (params) => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    dimension: params,
  };
  let res = await getDoorThroughType(param);
  let color = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
  let arr = res.data.map((item, index) => {
    return {
      label: item.name,
      color: color[index],
      value: item.value,
    };
  });
  return arr;
};
// 实时通行数据
export const throughData = async () => {
  let param = {
    pageSize: 50,
    pageNumber: 1,
  };
  let res = await getDoorEventRecord(param);
  res.records.forEach((item) => {
    item.eventTime = moment(item.eventTime).format("YYYY-MM-DD HH:mm:ss");
  });
  return res.records;
};
// 通行分析
export const trafficAnalysis = async (params) => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    dimension: params,
  };
  let colorList = ["#328BF7", "#F14545", "#FFC700", "#EF424A"];
  let res = await getDoorAccessSummary(param);
  const rows = Array.isArray(res?.data) ? res.data : [];
  let total = 0;
  let arr = rows.map((item, index) => {
    total += Number(item.value) || 0;
    const name = String(item.name ?? "");
    const color = /异常|告警|报警|违规|失败/.test(name)
      ? "#F14545"
      : /正常|成功/.test(name)
        ? "#328BF7"
        : colorList[index % colorList.length];
    return { label: item.name, color, value: Number(item.value) || 0 };
  });
  return {
    total,
    arr,
  };
};
