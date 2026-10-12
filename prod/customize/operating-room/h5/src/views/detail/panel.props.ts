import { operatingRoomDeviceCode } from '@ghcloud/cube-operating-room-service'

export const smallCardList = [
  { title: '室内压力', code: 'interiorPressure', value: undefined, unit: '', status: '', iconPath: '/images/icon/room-pressure.webp', display: 1 },
  { title: '实时温度', code: 'temperature', value: undefined, unit: '', status: '', iconPath: '/images/icon/realtime-temperature.webp', display: 1 },
  { title: '相对湿度', code: 'humidity', value: undefined, unit: '', status: '', iconPath: '/images/icon/relative-temperature.webp', display: 1 },
  { title: '新风量', code: 'airVolume', value: undefined, unit: '', status: '', iconPath: '/images/icon/fresh-air-volume.webp', display: 1 },
  { title: '有机挥发物', code: 'traceHarmfulGases', value: undefined, unit: '', status: '', iconPath: '/images/icon/harmful-gas.webp', display: 1 },
  { title: '氧浓度', code: 'oxygenConcentration', value: undefined, unit: '', status: '', iconPath: '/images/icon/oxygen-concentration.webp', display: 1 },
]

const getMiddleCardList = (): {
  value: undefined;
  unit: string;
  status: string;
  display: number;
  title: string;
  code: string;
}[] => {
  return operatingRoomDeviceCode
    .filter(e => smallCardList.findIndex(ele => ele.code === e.code) === -1)
    .map(e => {
      return {
        ...e,
        value: undefined,
        unit: '',
        status: '',
        display: 1
      }
    })
}
export const middleCardList = getMiddleCardList()
