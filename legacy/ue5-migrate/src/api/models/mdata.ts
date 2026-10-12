export interface SceneDataType{
    id:string,
    name:string,
    level:number,
    sort:number,
    parentId:string|null,
    code:string,
    fileVO?:ReturnFileType,
    children?:SceneDataType[],
    disabled?:boolean,
    scenarioTypes:string[]
}
export interface ReturnAreaScenePanelConfig{
    businessId:string,
    businessType:string,
    id:string,
    panelConfig:string,
    panelPosition:PanelPosition,
    universalPanelVo:RootObject
}
/**
 * 区域类型
 */
export interface AreaType{
    id:string,
    parentId:string|null,
    name:string,
    code:string,
    aliasName:string|null,
    level:number,
    children?:AreaType[],
    sequence:string,
    sort:number|null,
    visualizationAreaType:string
}
export interface RootObject {
	id: string;
	tableOneName: string;
	tableOne: string;
	tableTwoName: string;
	tableTwo: string;
	tableThreeName: string;
	tableThree: string;
	businessId: string;
    items:string;
}