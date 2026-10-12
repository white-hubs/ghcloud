import { getGroupControl, getActualTimeControl } from '@/api/securitymanagement'
import { useStateStore } from '@/pages/state/use-state-store'
const { globalState } = useStateStore()


export const getGroupControlData = async () => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
    }
    return await getGroupControl(param)
}
export const timeControlled = async () => {
    let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
    }
    let color = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    let res = await getActualTimeControl(param)
    let total = 0
    let arr = res.map((item, index) => {
        if (item.name === '时控计划') {
          //@ts-ignore
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