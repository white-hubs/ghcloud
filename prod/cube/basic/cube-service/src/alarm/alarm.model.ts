import type { EmergencyEventType, EmergencyType } from '../emergency/emergency.model'
export interface AlarmLevels {
  code: 'one_level' | 'two_level' | 'three_level' | 'four_level';
  id: string;
  name: '一级' | '二级' | '三级' | '四级';
  sort: number;

}
export interface BasicInfoData {
  alarmLevelData: AlarmLevels[] ;
  emergencyEventTypes: EmergencyEventType[];
  emergencyTypes: EmergencyType[];
  openCommandDispatch: boolean;

}
