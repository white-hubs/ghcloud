/**
 * @说明 业务图表组件
 */
export const AlarmChartComponent = {
  ua: 'VoltageComponent', //A相电压
  ub: 'VoltageComponent', //B相电压
  uc: 'VoltageComponent',// C相电压
  i: 'VoltageComponent', //剩余电流
  ia: 'VoltageComponent',// A相电流
  ib: 'VoltageComponent',//B相电流
  ic: 'VoltageComponent',//C相电流
  temp_a: 'HeatComponent',//A相温度
  temp_b: 'HeatComponent',//B相温度
  temp_c: 'HeatComponent',//C相温度
  pressure: 'VoltageComponent',//压力
  temp: 'HeatComponent', // 温度
  hum: 'HeatComponent', //湿度
  bat_temp: 'HeatComponent',  //电池温度
  work_mode: 'UpsStatusComponent',//UPS设备状态
  ups_status: 'UpsStatusComponent',//UPS状态
  bat_time: 'BatteryRemainderComponent' //电池剩余时间
}