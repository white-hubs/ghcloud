import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZBusinessService } from './modules/business'
import { PZDeviceCardService } from './modules/device'
import { PZEnergyService } from './modules/energy'
import { PZLaboratoryService } from './modules/laboratory'
import { PZParkSafetyCardService } from './modules/park-safety'
import { PZParingService } from './modules/parking'
import { PZPropertyCardService } from './modules/property'
import { PZPublicCardService } from './modules/public'
import { PZSchoolCardService } from './modules/school'
import { PZSituationalCardService } from './modules/situational'
import { PZSpaceCardService } from './modules/space'
import dayjs from 'dayjs'

/**
 * @description 彭州卡片服务
 */
export const PZService = {
  /** 实验室 */
  laboratory: new PZLaboratoryService(),
  /** 能耗 */
  energy: new PZEnergyService(),
  /** 招商 */
  business: new PZBusinessService(),
  /** 停车 */
  parking: new PZParingService(),
  /** 校园 */
  school: new PZSchoolCardService(),
  /** 设备 */
  device: new PZDeviceCardService(),
  /** 园区安全 */
  parkSafety: new PZParkSafetyCardService(),
  /** 物业 */
  property: new PZPropertyCardService(),
  /** 公共服务 */
  public: new PZPublicCardService(),
  /** 空间 */
  space: new PZSpaceCardService(),
  /** 态势感知 */
  situational: new PZSituationalCardService()
}

/**
 * @description 时间转换助手方法
 * @param time 时间类型
 * @returns 时间区间
 */
export const getTimeRangeInterval = (time: PeriodStatTypeEnum): string => {
  let timeRange: dayjs.Dayjs[] = []
  switch (time){
    case PeriodStatTypeEnum.TODAY:
      timeRange = [dayjs().startOf('day'), dayjs().endOf('day')]
      break;
    case PeriodStatTypeEnum.THIS_WEEK:
      timeRange = [dayjs().startOf('week'), dayjs().endOf('week')]
      break;
    case PeriodStatTypeEnum.THIS_MONTH:
      timeRange = [dayjs().startOf('month'), dayjs().endOf('month')]
      break;
    case PeriodStatTypeEnum.THIS_YEAR:
      timeRange = [dayjs().startOf('year'), dayjs().endOf('year')]
      break;
    case PeriodStatTypeEnum.THIS_QUARTER:
      // 获取当前月份
      const currentMonth = dayjs().month();
      // 计算当前季度的起始月份（0, 3, 6, 9）
      const startMonth = Math.floor(currentMonth / 3) * 3;
      // 获取当前季度的起始日期
      const startOfQuarter = dayjs().month(startMonth).startOf('month');
      // 获取当前季度的结束日期
      const endOfQuarter = dayjs().month(startMonth + 2).endOf('month');
      timeRange = [startOfQuarter, endOfQuarter]
      break;
  }
  function formatDate (date: dayjs.Dayjs): string {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
  return formatDate(timeRange[0]) + ',' + formatDate(timeRange[1])
}