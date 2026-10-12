import { getDeviceListBuyScene } from "@/api/device";
import { getAreaList, getAreaScenePanelConfig, sceneTypePage } from "@/api/mdata";
import { useStateStore } from '@/pages/state/use-state-store'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
interface SceneDevice{
    type?:string,
    businessType?:string,
    pageSize:number,
    pageNumber:number 
}
/**
 * 区域列表
 */
export const areaData = async(keyword?:string) =>{
    const res = await getAreaList({keyword:keyword});
    return {
        res
    }
}
/**
 * 业务菜单
 * @param keyword 
 * @returns 
 */ 
export const businessMenu = async(keyword?:string) =>{
    const res = await sceneTypePage({keyword:keyword});
    return {
        res
    }
}
/**
 * 业务菜单面板配置
 */
export const menuPanelConfig = async <T>(parmas?:T) =>{
    let res = await getAreaScenePanelConfig(parmas);
    return {
        res
    }
}
/**
 * 根据业务id和区域id获取设备列表
 */
export const requestDeviceList = async (params?:SceneDevice) =>{
    const { globalState } = useStateStore()
    let query = {
        sceneType:globalState.business.currentMenu,
        areaId:globalState.business.currentAreaId,
        ...params
    }
    try {
        const res = await getDeviceListBuyScene(query)
        return res
    } catch (error) {
        return []
    }
}