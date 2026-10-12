export interface FloorType {
value: any
    id:string,
    name:string,
    code:string,
    aliasName:string|null,
    level:number,
    selected:boolean,
    actorId:string,
}
export interface FloorOper {
    hidFloors:FloorType[],
    showFloors:FloorType[],
    selectedFloor:FloorType
}