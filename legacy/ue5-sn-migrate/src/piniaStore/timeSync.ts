import moment from "moment";
import { defineStore } from "pinia";

import { ModelValueItf } from "../components/businessPanel/public/types";

// 默认时间设置
const getDefaultTimeValue = (): ModelValueItf => ({
  timeType: "THIS_YEAR",
  dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
});

const startFormat = "YYYY-MM-DD 00:00:00";
const endFormat = "YYYY-MM-DD 23:59:59";

export const storeTimeSync = defineStore("timeSync", {
  state: () => ({
    // 使用普通对象存储不同菜单页面的时间状态，而不是Map
    menuTimeMap: {} as Record<string, ModelValueItf>,
    // 当前活动的菜单页面
    currentMenuPage: "",
  }),
  getters: {
    // 获取当前菜单页面的时间状态
    getCurrentMenuTime(): ModelValueItf {
      if (!this.menuTimeMap[this.currentMenuPage]) {
        this.menuTimeMap[this.currentMenuPage] = getDefaultTimeValue();
      }
      const cachedTime = this.menuTimeMap[this.currentMenuPage] as ModelValueItf;
      switch (cachedTime.timeType) {
        case "THIS_YEAR":
          cachedTime.dateRange = [moment().startOf("year").format(startFormat), moment().endOf("year").format(endFormat)];
          break;
        case "THIS_MONTH":
          cachedTime.dateRange = [moment().startOf("month").format(startFormat), moment().endOf("month").format(endFormat)];
          break;
        case "THIS_WEEK":
          cachedTime.dateRange = [moment().startOf("week").format(startFormat), moment().endOf("week").format(endFormat)];
          break;
        case "TODAY":
          cachedTime.dateRange = [moment().startOf("day").format(startFormat), moment().endOf("day").format(endFormat)];
          break;
        case "PAST_YEAR":
          cachedTime.dateRange = [moment().subtract(1, "year").format(startFormat), moment().format(endFormat)];
          break;
        case "CUSTOM":
        default:
      }
      return cachedTime;
    },
  },
  actions: {
    // 设置当前活动的菜单页面
    setCurrentMenuPage(menuPage: string) {
      this.currentMenuPage = menuPage;
      // 如果该菜单页面没有时间状态，则初始化一个默认值
      if (!this.menuTimeMap[menuPage]) {
        this.menuTimeMap[menuPage] = getDefaultTimeValue();
      }
    },
    // 更新当前菜单页面的时间状态
    updateCurrentMenuTime(timeValue: ModelValueItf) {
      this.menuTimeMap[this.currentMenuPage] = timeValue;
    },
  },
  persist: true,
});
