/**
 * @说明 业务图表组件
 */
export const AlarmChartComponent = {
  ua: 'ModalVoltageComponent', //A相电压
  ub: 'ModalVoltageComponent', //B相电压
  uc: 'ModalVoltageComponent',// C相电压
  i: 'ModalVoltageComponent', //剩余电流
  ia: 'ModalVoltageComponent',// A相电流
  ib: 'ModalVoltageComponent',//B相电流
  ic: 'ModalVoltageComponent',//C相电流
  temp_a: 'ModalHeatComponent',//A相温度
  temp_b: 'ModalHeatComponent',//B相温度
  temp_c: 'ModalHeatComponent',//C相温度
  pressure: 'ModalVoltageComponent',//压力
  temp: 'ModalHeatComponent', // 温度
  hum: 'ModalHeatComponent', //湿度
  bat_temp: 'ModalHeatComponent',  //电池温度
  work_mode: 'ModalUpsStatusComponent',//UPS设备状态
  ups_status: 'ModalUpsStatusComponent',//UPS状态
  bat_time: 'ModalBatteryRemainderComponent' //电池剩余时间
}