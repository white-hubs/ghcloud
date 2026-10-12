import moment from "moment";

import { resolveScaledFontSize, ROOT_VALUE } from "@/application/bootstrap/viewport-metrics";
import { storeArea } from "@/visualization-core/stores/area";

// 获取当前时间
export function getNowDateTime(format: string = "YYYY-MM-DD HH:mm:ss") {
  const nowDateTime = moment().format(format);
  return nowDateTime;
}
//将16进制颜色转为rgba
export function hex2Rgba(hex: string, opacity: number) {
  if (!hex) hex = "#2989FF";
  return (
    "rgba(" +
    parseInt("0x" + hex.slice(1, 3)) +
    "," +
    parseInt("0x" + hex.slice(3, 5)) +
    "," +
    parseInt("0x" + hex.slice(5, 7)) +
    "," +
    opacity +
    ")"
  );
}

export function getAreaCamera(area: string, name?: string) {
  if ((window as any).config.perspective) {
    let curItem = (window as any).config.perspective.find((item) => {
      if (item.area === area) {
        return item;
      } else if (area.indexOf("-") !== -1) {
        if (area.indexOf(item.area) !== -1 && item.area.indexOf("-") !== -1) {
          return item;
        } else if (item.area === name) {
          return item;
        }
      }
    });

    let curItems = (window as any).config.perspective.find((item) => {
      if (item.area === name || item.area === area) {
        return item;
      }
    });
    if (curItems) {
      return curItems.camera;
    } else if (curItem) {
      return curItem.camera;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/** 获取视角配置 */
export function getPerspective(area, name?) {
  if ((window as any).config.perspective) {
    let curItem = (window as any).config.perspective.find((item) => {
      if (item.area === area || item.area === name) {
        return item;
      }
    });
    if (curItem) {
      return curItem;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
export function getApplicationPerspective(application) {
  if ((window as any).config.applicationPerspective) {
    let curItem = (window as any).config.applicationPerspective.find((item) => {
      if (item.application === application) {
        return item;
      }
    });
    return curItem || null;
  }
}
/** 防抖 */
export function debounce(fn, delay, immdiate = false, resultCallback = null) {
  let timer = null;
  let isInvoke = false;
  function _debounce(...arg) {
    if (timer) clearTimeout(timer);
    if (immdiate && !isInvoke) {
      const result = fn.apply(this, arg);
      if (resultCallback && typeof resultCallback === "function") resultCallback(result);
      isInvoke = true;
    } else {
      timer = setTimeout(() => {
        const result = fn.apply(this, arg);
        if (resultCallback && typeof resultCallback === "function") resultCallback(result);
        isInvoke = false;
        timer = null;
      }, delay);
    }
  }

  _debounce.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    isInvoke = false;
  };

  return _debounce;
}

/** 添加样式类 */
export function addClass(element: HTMLElement, cls: string) {
  if (!element.className) {
    element.className = cls;
  } else {
    let newClassName = element.className;
    newClassName += " ";
    newClassName += cls;
    element.className = newClassName;
  }
}
/** 移除样式类 */
export function removeClass(element: HTMLElement, cls: string) {
  if (hasClass(element, cls)) {
    let reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    element.className = element.className.replace(reg, " ");
  }
}

/** 检查是否有样式类 */
function hasClass(element: HTMLElement, cls: string) {
  return element.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

// 今日、本周、本月、本年 x轴数据
type TimeType = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";
export function getXDataByTime(type: string) {
  let XData: string[] = [];
  switch (type) {
    case "TODAY":
      XData = ["4", "8", "12", "16", "20", "24h"];
      break;
    case "THIS_WEEK":
      XData = ["1", "2", "3", "4", "5", "6", "7天"];
      break;
    case "THIS_MONTH":
      XData = ["1", "5", "10", "15", "20", "25", "30日"];
      break;
    case "THIS_YEAR":
      XData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12月"];
      break;
    default:
      XData = ["4", "8", "12", "16", "20", "24h"];
      break;
  }
  return XData;
}

// 获取x轴数据
/**
 * @param {type} 时间类型
 */
export function getXaxleData(type: string) {
  let XData: string[] = [];
  switch (type) {
    case "TODAY":
      for (let index = 0; index <= 24; index++) {
        if (index === 24) {
          XData.push(index.toString() + "时");
        } else {
          XData.push((index + 1).toString() + ":00");
        }
      }
      break;
    case "THIS_WEEK":
      XData = ["1", "2", "3", "4", "5", "6", "7天"];
      break;
    case "THIS_MONTH":
      for (let index = 0; index < 31; index++) {
        if (index === 30) {
          XData.push(index.toString() + "日");
        } else {
          XData.push(index.toString());
        }
      }
      break;
    case "THIS_YEAR":
      XData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12月"];
      break;
    case "THIS_PERID":
      XData = ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24h"];
      break;
    default:
      XData = ["04:00", "08:00", "12:00", "16:00", "20:00", "24h"];
      break;
  }
  return XData;
}

/** 获取当前区域层级  */
export function getCurrentAreaInfo() {
  const piniaStoreArea = storeArea();
  const res = {
    build: piniaStoreArea.currentBuild,
    floor: piniaStoreArea.currentFloor,
  };
  return res;
}

// 处理内联样式px转换rem
export function px2rem(px: string) {
  if (/%/gi.test(px)) {
    // 有百分号%，特殊处理，表述pc是一个有百分号的数，比如：90%
    return px;
  } else {
    return parseFloat(px) / 192 + "rem";
  }
}
// 时间参数转换
export const setTimeType = (value: string) => {
  if (value === "TODAY") {
    return "TODAY";
  } else if (value === "THIS_WEEK") {
    return "WEEK";
  } else if (value === "THIS_MONTH") {
    return "MONTH";
  } else if (value === "THIS_YEAR") {
    return "YEAR";
  }
};

export const getallNumber = (data, value) => {
  let total = 0;

  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      total += data[i][value];
    }
  }

  return total;
};

/**
 * 数组拆分
 * size每组数组多少个，如：10
 * array需要拆分的数组
 */
export const splitArray = (array, size) => {
  let data = [];
  for (let i = 0; i < array.length; i += size) {
    data.push(array.slice(i, i + size));
  }
  return data;
};

export function getXDataByType(type: string, data: Array<any>): Array<any> {
  let XData = [...data],
    unit = "";
  switch (type) {
    case "TODAY":
      unit = "时";
      break;
    case "THIS_WEEK":
      unit = "日";
      break;
    case "THIS_MONTH":
      unit = "日";
      break;
    case "THIS_YEAR":
      unit = "月";
      break;
    default:
      unit = "月";
      break;
  }
  XData[data.length - 1] = XData[data.length - 1] + unit;
  return XData;
}

// 请求一次之后自动分页
export const autoPage = (target, total, pages: number = 1) => {
  if (!target.page) {
    target.total = total;
    target.pages = pages;
    target.pageNumber++;
    if (target.pageNumber >= target.pages + 1) target.pageNumber = 1;
  } else {
    target.page.total = total;
    target.page.pages = pages;
    target.page.pageNumber++;
    if (target.page.pageNumber >= target.page.pages + 1) target.page.pageNumber = 1;
  }
};

export const TwoArray = (items: unknown[], size) => {
  const results: unknown[][] = [];
  let tempStackItems: unknown[] = [];
  for (const item of items) {
    tempStackItems.push(item);
    if (tempStackItems.length === size) {
      results.push(tempStackItems);
      tempStackItems = [];
    }
  }
  if (tempStackItems.length > 0) {
    results.push(tempStackItems);
  }
  return results;
};
export const HData = (target, total, pages: number = 1) => {
  if (!target.page) {
    target.total = total;
    target.pages = pages;
    target.pageNumber++;

    if (target.pageNumber >= target.pages + 1) target.pageNumber = 1;

    let start = (target.pageNumber - 1) * target.pageSize;
    let end = start + target.pageSize;
    return {
      start,
      end,
    };
  } else {
    target.page.total = total;
    target.page.pages = pages;
    target.page.pageNumber++;
    if (target.page.pageNumber >= target.page.pages + 1) target.page.pageNumber = 1;
    let start = (target.page.pageNumber - 1) * target.page.pageSize;
    let end = start + target.page.pageSize;
    return {
      start,
      end,
    };
  }
};
export const getcurrentData = (risk, name, rank = true) => {
  // log
  // if(!rank){
  //   risk.splice(0, 1);
  //   return true
  // }

  let currentName = risk.find((item) => item.marketName == name);

  let currentIndex = risk.findIndex((item) => item.marketName == name);

  if (currentName != undefined) {
    risk.splice(currentIndex, 1);
    risk.unshift(currentName);
    return false;
  } else {
    // risk.splice(currentIndex, 1);
    return true;
  }
};
// 数组处理，前面几个展示，多余的展示为其他
export const setDeviceData = (data, colors) => {
  const list = (() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray((data as { content?: unknown }).content)) return (data as { content: unknown[] }).content;
      if (Array.isArray((data as { data?: unknown }).data)) return (data as { data: unknown[] }).data;
      if (Array.isArray((data as { records?: unknown }).records)) return (data as { records: unknown[] }).records;
    }
    return [];
  })() as Array<Record<string, unknown>>;

  const resolveCount = (item: Record<string, unknown>): number => {
    const candidates = [item.deviceNumber, item.num, item.deviceNum, item.count, item.totalNumber, item.total];
    for (const candidate of candidates) {
      if (candidate == null || candidate === "") continue;
      const n = Number(candidate);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  };

  const sorted = [...list].sort((a, b) => resolveCount(b) - resolveCount(a));
  const dataArr: Array<{ areaId?: unknown; name: unknown; value: number; color: string }> = [];
  let other = 0;

  sorted.forEach((item, index) => {
    const value = resolveCount(item);
    if (index <= 2) {
      dataArr.push({
        areaId: item.areaId,
        name: item.areaName ?? item.name ?? "--",
        value,
        color: colors[index],
      });
    } else {
      other += value;
    }
  });

  if (sorted.length > 3) {
    dataArr.push({
      name: "其他",
      value: other,
      color: "#19F8F7",
    });
  }
  return dataArr;
};
export const isHttpUrl = (url: string): boolean => {
  return url.includes("http") || url.includes("https");
};

/** 动态计算fontSize */
export function calcFontSize(size: number) {
  const root = document.documentElement;
  const scaleRaw = getComputedStyle(root).getPropertyValue("--ue5-ui-scale").trim();
  const scaleValue = Number(scaleRaw);
  const uiScale =
    Number.isFinite(scaleValue) && scaleValue > 0
      ? scaleValue
      : (() => {
          const rootFontSize = Number.parseFloat(getComputedStyle(root).fontSize);
          return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize / ROOT_VALUE : 1;
        })();
  return resolveScaledFontSize(size, uiScale);
}
// 根据日期类型，获取X轴数据
export const generateXAxisData = (timeType: string): string[] => {
  switch (timeType) {
    case "TODAY":
      return Array.from({ length: 24 }, (_, i) => `${i}点`);
    case "THIS_WEEK":
      return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    case "THIS_MONTH":
      // 本月展示1号到当月最后一天
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}号`);
    case "THIS_YEAR":
      return Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    default:
      return [];
  }
};
