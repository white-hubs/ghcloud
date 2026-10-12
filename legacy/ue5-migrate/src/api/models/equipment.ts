interface DeviceGenreNums {
    genre: string | null,
    genreName: string,
    num: number,
    proportion: number
}
interface DeviceStatusNums {
    [x: string]: any
    name: string,
    num: number
}
interface Devices {
    areaId: string,
    areaName: string,
    code: string,
    deviceId: string,
    deviceName: string,
    deviceStatus: string,
    genreName: string,
}
export interface EquipmentInfoType {
    id: string,
    name: string,
    code:string,
    modelName: string,
    modelId:string,
    areaName: string,
    deviceNumber:number,
    areaIdList:string[],
    areaId:string,
    deviceStatus: string,
    communicationStatus: string,
    images: string[],
    genreName:string,
    genreId:string,
    status:string,
    identify:string
}
interface deviceAttributesType {
    attributeCode:string,
    attributeId:string,
    attributeName:string,
    attributeKeyValueVos:{
        keyName:string,
        value:string,
    }[],
    dataType:string,
    permission:string,
    valueMax:number|string,
    valueMin:number|string,
    attributeUnitName:string
}
export interface EquipmentInfo {
    deviceGenreNums: DeviceGenreNums[],
    deviceNum: number,
    deviceStatusNums: DeviceStatusNums[]
    devices: Devices[]
}
export interface EquipmentDetails {
    detail: EquipmentInfoType,
    deviceAttributes: deviceAttributesType[]
}