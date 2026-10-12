import { ref } from 'vue'
export default () => {
  const alarmLeaveOptions = ref([
    {
      label: '一级报警',
      value: 'one_level',
      color: '#FF4070'
    },
    {
      label: '二级报警',
      value: 'two_level',
      color: '#FBA33F'
    },
    {
      label: '三级报警',
      value: 'three_level',
      color: '#5654F5'
    },
    {
      label: '四级报警',
      value: 'four_level',
      color: '#1890FF'
    }
  ])
  const alarmStatusOptions = ref([
    {
      label: '待确认',
      value: 'ALARM_UN_CONFIRMED',
      color: '#29C2FF'
    },
    {
      label: '处理中',
      value: 'ALARM_PROGRESS_CONFIRMED',
      color: '#FFC700'
    },
    {
      label: '已挂起',
      value: 'ALARM_SUSPEND',
      color: '#74AEE7'
    },
    {
      label: '已处理',
      value: 'ALARM_HANDLER',
      color: '#00F27B'
    }
  ])
  return {
    alarmLeaveOptions,
    alarmStatusOptions
  }
}
/**
 * 目前暂时是用设备类型名称对应ue模型中设备类型图标，后续需要将设备类型做为数据字典，设备类型带code，通过code来对应
 */
export enum DeviceTypeIcon {
  '摄像机' = 0,
  '枪机' = 1,
  '球机A' = 2,
  '球机B' = 3,
  '消火栓' = 4,
  '电气' = 5,
  '照明' = 6,
  '空调' = 7,
  '排风' = 8,
  '排水' = 9,
  '机房' = 10,
  '广播' = 11,
  '门禁' = 12,
  '电梯' = 13,
  'UPS' = 14,
  '温湿度' = 15,
  '烟感' = 16,
  '电表箱' = 17,
  '床头分机' = 18,
  '灯带' = 19,
  '电子显示屏' = 20,
  '流量计' = 21,
  '气体报警箱' = 22,
  '签到机' = 23,
  '浅污泵' = 24,
  '人脸机' = 25,
  '示教前端机' = 26,
  '示教终端机' = 27,
  '手报' = 28,
  '手持对讲机' = 29,
  '刷卡机' = 30,
  '水表箱' = 31,
  '停车位' = 32,
  '压力计' = 33,
  '闸机' = 34,
  '主机' = 35,
  '车位探测器' = 36,
  '道闸' = 37,
  '低压空气断路器' = 38,
  '发电机' = 39,
  '风机盘管' = 40,
  '扶梯' = 41,
  '功率放大器' = 42,
  '红外探测器' = 43,
  '呼叫站' = 44,
  '紧急按钮' = 45,
  '精密空调' = 46,
  '控制主机' = 47,
  '冷冻机组' = 48,
  '冷却泵' = 49,
  '冷却塔' = 50,
  '配电箱' = 51,
  '生活水箱' = 52,
  '声光报警器' = 53,
  '水泵' = 54,
  '温控仪变压器' = 55,
  '智能气表' = 56,
  '充电桩' = 57,
  '灭火器' = 58,
  '水压监测' = 59,
  '理货机' = 60,
}
export enum DeviceStatusCode {
  'ALARM' = 1,
  'TROUBLE' = 3,
  'OFFLINE' = 2,
  'NORMAL' = 0,
}
export const marketlist = [
  '宁夏海吉星', '广西新柳邕', '惠州海吉星', '沈阳海吉星', '长春海吉星', '深圳光明海吉星',
  '深圳平湖海吉星', '天津静海海吉星', '上海农批', '湖南长沙海吉星', '广西新柳邕海吉星',
  '安徽蚌埠海吉星', '广西南宁海吉星', '成都农批', '广东惠州海吉星', '湖南岳阳海吉星',
  '安徽安庆海吉星', '南昌', '深圳福田农批', '西安海吉星', '九江农批']

export function getRandomFive (length = 5) {
  const five = marketlist.length < length ? marketlist.length : length
  const result = new Array(five)
  for (let i = 0; i < five; i++) {
    const randomIndex = Math.floor(Math.random() * marketlist.length)
    result[i] = marketlist[randomIndex]
  }
  return result
}
export function getrandom (value = 1000) {
  return Math.floor(Math.random() * value) + 1
}
export const DeviceAlarmType = {
  火: 'FireBig',
  烟: 'SmokeA',
  蒸汽: 'SteamA',
  水: 'WaterLeakA',
}
