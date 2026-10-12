import { getGroupControl, getActualTimeControl } from '@/api/securitymanagement'
import { storeArea } from "@/piniaStore/area"
import { storeMenu } from "@/piniaStore/menu"
const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();

export const getGroupControlData = async () => {
    let param = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
    }
    return await getGroupControl(param)
}
export const timeControlled = async () => {
    let param = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
    }
    let color = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    let res = await getActualTimeControl(param)
    let total = 0
    let arr = res.map((item, index) => {
        if (item.name === '时控计划') {
            total = item.value
        }
        return {
            label: item.name,
            color: color[index],
            value: item.value
        }
    })
    return {
        arr, total
    }
}